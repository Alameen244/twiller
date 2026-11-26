import Tweet from '../models/tweetModel.js';
import Comment from '../models/commentModel.js';
import User from '../models/userModel.js';
import { reserveTweetSlot, releaseTweetSlot } from '../services/subscriptionService.js';
import { deleteAudioFromCloudinary } from '../services/audioStorageService.js';
import { notifyKeywordTweet, deleteNotificationsForTweet } from '../services/notificationService.js';

const AUTHOR_FIELDS = '-firebaseUid -phoneNumber -isPhoneVerified';
const EMAIL_COLLATION = { locale: 'en', strength: 2 };

// Create new tweet
// Create new tweet (limited by the user's subscription plan)
export const createTweet = async (req, res) => {
  try {
    const { content, image } = req.body;

    if (!content) {
      return res.status(400).send({ error: 'Content is required' });
    }

    // The author is the logged-in user (from the Firebase token), never a value
    // from the request body, so nobody can post as, or use up the quota of,
    // another user.
    const requestingUser = await User.findOne({ email: req.firebaseUser.email }).collation(EMAIL_COLLATION);
    if (!requestingUser) {
      return res.status(401).send({ error: 'User not found' });
    }

    // Reserve one slot of the plan limit BEFORE saving (atomic counter).
    // For a user's first visit the counter starts from their existing tweets.
    const slot = await reserveTweetSlot(requestingUser._id, () =>
      Tweet.countDocuments({ author: requestingUser._id })
    );

    if (!slot.allowed) {
      return res.status(403).send({
        error: `You have reached the ${slot.plan.name} plan limit of ${slot.plan.tweetLimit} tweet(s). Upgrade your plan to post more.`,
        code: 'TWEET_LIMIT_REACHED',
        plan: slot.plan.id,
        limit: slot.plan.tweetLimit,
      });
    }

    const tweetData = {
      author: requestingUser._id,
      content,
    };

    if (image !== undefined) {
      tweetData.image = image;
    }

    const tweet = new Tweet(tweetData);
    try {
      await tweet.save();
    } catch (saveError) {
      // The tweet was not saved, so give the reserved slot back.
      await releaseTweetSlot(requestingUser._id);
      throw saveError;
    }

    // Keyword notifications (never throws, never blocks the response on failure).
    await notifyKeywordTweet(tweet, requestingUser);

    await tweet.populate('author', AUTHOR_FIELDS);
    return res.status(201).send(tweet);
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
};

// Get all tweets
export const getAllTweets = async (req, res) => {
  try {
    const tweet = await Tweet.find().sort({ timestamp: -1 }).populate('author', AUTHOR_FIELDS);
    return res.status(200).send(tweet);
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
};

// Toggle like on tweet
export const likeTweet = async (req, res) => {
  try {
    const { userId } = req.body;
    const tweet = await Tweet.findById(req.params.tweetid);
    if (!tweet) return res.status(404).send({ error: 'Tweet not found' });

    const alreadyLiked = tweet.likedBy.some((id) => id.toString() === userId);
    if (alreadyLiked) {
      tweet.likes = Math.max(0, tweet.likes - 1);
      tweet.likedBy = tweet.likedBy.filter((id) => id.toString() !== userId);
    } else {
      tweet.likes += 1;
      tweet.likedBy.push(userId);
    }

    await tweet.save();
    await tweet.populate('author', AUTHOR_FIELDS);
    return res.send(tweet);
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
};



// Toggle retweet
export const retweetTweet = async (req, res) => {
  try {
    const { userId } = req.body;
    const tweet = await Tweet.findById(req.params.tweetid);
    if (!tweet) return res.status(404).send({ error: 'Tweet not found' });

    const alreadyRetweeted = tweet.retweetedBy.some(
      (id) => id.toString() === userId
    );
    if (alreadyRetweeted) {
      tweet.retweets = Math.max(0, tweet.retweets - 1);
      tweet.retweetedBy = tweet.retweetedBy.filter(
        (id) => id.toString() !== userId
      );
    } else {
      tweet.retweets += 1;
      tweet.retweetedBy.push(userId);
    }

    await tweet.save();
    await tweet.populate('author', AUTHOR_FIELDS);
    return res.send(tweet);
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
};

// Delete tweet (owner only)
export const deleteTweet = async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.tweetid);
    if (!tweet) return res.status(404).json({ error: 'Tweet not found' });

    // Resolve the requesting Firebase user to their DB record
    const requestingUser = await User.findOne({ email: req.firebaseUser.email }).collation(EMAIL_COLLATION);
    if (!requestingUser) return res.status(401).json({ error: 'User not found' });

    // Ownership check: tweet.author (ObjectId) must match the requesting user's _id
    if (tweet.author.toString() !== requestingUser._id.toString()) {
      return res.status(403).json({ error: 'You can only delete your own posts' });
    }

    await Tweet.findByIdAndDelete(req.params.tweetid);
    await Promise.all([
      Comment.deleteMany({ tweet: tweet._id }),
      deleteNotificationsForTweet(tweet._id),
    ]);
    if (tweet.audio?.publicId) {
      await deleteAudioFromCloudinary(tweet.audio.publicId);
    }
    return res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

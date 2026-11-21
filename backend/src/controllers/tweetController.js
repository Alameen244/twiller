import Tweet from '../models/tweetModel.js';
import User from '../models/userModel.js';

const AUTHOR_FIELDS = '-firebaseUid -phoneNumber -isPhoneVerified';

// Create new tweet
export const createTweet = async (req, res) => {
  try {
    const { author, content, image } = req.body;

    if (!author || !content) {
      return res.status(400).send({ error: 'Author and content are required' });
    }

    const tweetData = {
      author,
      content
    };

    if (image !== undefined) {
      tweetData.image = image;
    }

    const tweet = new Tweet(tweetData);
    await tweet.save();
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
    const requestingUser = await User.findOne({ email: req.firebaseUser.email });
    if (!requestingUser) return res.status(401).json({ error: 'User not found' });

    // Ownership check: tweet.author (ObjectId) must match the requesting user's _id
    if (tweet.author.toString() !== requestingUser._id.toString()) {
      return res.status(403).json({ error: 'You can only delete your own posts' });
    }

    await Tweet.findByIdAndDelete(req.params.tweetid);
    return res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

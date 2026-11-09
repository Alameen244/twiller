import Tweet from '../models/tweet.js';

// Create new tweet
export const createTweet = async (req, res) => {
  try {
    const tweet = new Tweet(req.body);
    await tweet.save();
    await tweet.populate('author');
    return res.status(201).send(tweet);
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
};

// Get all tweets
export const getAllTweets = async (req, res) => {
  try {
    const tweet = await Tweet.find().sort({ timestamp: -1 }).populate('author');
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
    await tweet.populate('author');
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
    await tweet.populate('author');
    return res.send(tweet);
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
};

import mongoose from 'mongoose';
import Comment from '../models/commentModel.js';
import Tweet from '../models/tweetModel.js';
import User from '../models/userModel.js';

const AUTHOR_FIELDS = '-firebaseUid -phoneNumber -isPhoneVerified';
const EMAIL_COLLATION = { locale: 'en', strength: 2 };
const MAX_COMMENT_LENGTH = 280;

// GET /api/v1/comments/:tweetid -> fetch comments for a tweet (newest first)
export const getCommentsByTweet = async (req, res) => {
  try {
    const { tweetid } = req.params;
    if (!mongoose.Types.ObjectId.isValid(tweetid)) {
      return res.status(400).json({ error: 'Invalid tweet id' });
    }

    const [comments, tweet] = await Promise.all([
      Comment.find({ tweet: tweetid })
        .sort({ timestamp: -1 })
        .limit(100)
        .populate('author', AUTHOR_FIELDS),
      Tweet.findById(tweetid).select('comments').lean(),
    ]);

    if (!tweet) {
      return res.status(404).json({ error: 'Tweet not found' });
    }

    return res.status(200).json({
      comments,
      commentsCount: tweet.comments ?? comments.length,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// POST /api/v1/comments/:tweetid -> add a comment to a tweet
export const createComment = async (req, res) => {
  try {
    const { tweetid } = req.params;
    if (!mongoose.Types.ObjectId.isValid(tweetid)) {
      return res.status(400).json({ error: 'Invalid tweet id' });
    }

    const rawContent = typeof req.body?.content === 'string' ? req.body.content.trim() : '';
    if (!rawContent) {
      return res.status(400).json({ error: 'Comment content is required' });
    }
    if (rawContent.length > MAX_COMMENT_LENGTH) {
      return res.status(400).json({ error: `Comment cannot exceed ${MAX_COMMENT_LENGTH} characters` });
    }

    const [requestingUser, tweet] = await Promise.all([
      User.findOne({ email: req.firebaseUser.email }).collation(EMAIL_COLLATION),
      Tweet.findById(tweetid).select('_id'),
    ]);

    if (!requestingUser) {
      return res.status(401).json({ error: 'User not found' });
    }
    if (!tweet) {
      return res.status(404).json({ error: 'Tweet not found' });
    }

    const comment = new Comment({
      tweet: tweet._id,
      author: requestingUser._id,
      content: rawContent,
    });
    await comment.save();

    const updatedTweet = await Tweet.findByIdAndUpdate(
      tweet._id,
      { $inc: { comments: 1 } },
      { new: true, select: 'comments' }
    );

    await comment.populate('author', AUTHOR_FIELDS);

    return res.status(201).json({
      comment,
      commentsCount: updatedTweet?.comments ?? 1,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// DELETE /api/v1/comments/:commentid -> delete own comment
export const deleteComment = async (req, res) => {
  try {
    const { commentid } = req.params;
    if (!mongoose.Types.ObjectId.isValid(commentid)) {
      return res.status(400).json({ error: 'Invalid comment id' });
    }

    const [comment, requestingUser] = await Promise.all([
      Comment.findById(commentid),
      User.findOne({ email: req.firebaseUser.email }).collation(EMAIL_COLLATION),
    ]);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    if (!requestingUser) {
      return res.status(401).json({ error: 'User not found' });
    }
    if (comment.author.toString() !== requestingUser._id.toString()) {
      return res.status(403).json({ error: 'You can only delete your own comments' });
    }

    await Comment.findByIdAndDelete(commentid);

    const updatedTweet = await Tweet.findOneAndUpdate(
      { _id: comment.tweet, comments: { $gt: 0 } },
      { $inc: { comments: -1 } },
      { new: true, select: 'comments' }
    );

    return res.status(200).json({
      message: 'Comment deleted successfully',
      commentId: comment._id,
      commentsCount: updatedTweet?.comments ?? 0,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

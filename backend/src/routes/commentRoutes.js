import express from 'express';
import {
  getCommentsByTweet,
  createComment,
  deleteComment,
} from '../controllers/commentController.js';
import { translateComments } from '../controllers/translationController.js';
import { verifyFirebaseToken } from '../middlewares/firebaseAuth.middleware.js';
import {
  commentReadLimiter,
  commentCreateLimiter,
  commentDeleteLimiter,
  translationRateLimiter,
} from '../middlewares/rateLimiters/index.js';

const router = express.Router();

// Register static /translate before parameterized /:tweetid route
router.post('/translate', verifyFirebaseToken, translationRateLimiter, translateComments);
router.get('/:tweetid', commentReadLimiter, getCommentsByTweet);
router.post('/:tweetid', verifyFirebaseToken, commentCreateLimiter, createComment);
router.delete('/:commentid', verifyFirebaseToken, commentDeleteLimiter, deleteComment);

export default router;

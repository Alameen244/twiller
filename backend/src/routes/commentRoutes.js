import express from 'express';
import {
  getCommentsByTweet,
  createComment,
  deleteComment,
} from '../controllers/commentController.js';
import { verifyFirebaseToken } from '../middlewares/firebaseAuth.middleware.js';
import {
  commentReadLimiter,
  commentCreateLimiter,
  commentDeleteLimiter,
} from '../middlewares/rateLimiters/index.js';

const router = express.Router();

router.get('/:tweetid', commentReadLimiter, getCommentsByTweet);
router.post('/:tweetid', verifyFirebaseToken, commentCreateLimiter, createComment);
router.delete('/:commentid', verifyFirebaseToken, commentDeleteLimiter, deleteComment);

export default router;

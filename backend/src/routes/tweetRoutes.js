import express from 'express';
import { createTweet, getAllTweets, likeTweet, retweetTweet, deleteTweet } from '../controllers/tweetController.js';
import { verifyFirebaseToken } from '../middlewares/firebaseAuth.middleware.js';

const router = express.Router();

router.post('/post', createTweet);
router.get('/post', getAllTweets);
router.post('/like/:tweetid', likeTweet);
router.post('/retweet/:tweetid', retweetTweet);
router.delete('/:tweetid', verifyFirebaseToken, deleteTweet);

export default router;

import express from 'express';
import { createTweet, getAllTweets, likeTweet, retweetTweet } from '../controllers/tweetController.js';

const router = express.Router();

router.post('/post', createTweet);
router.get('/post', getAllTweets);
router.post('/like/:tweetid', likeTweet);
router.post('/retweet/:tweetid', retweetTweet);

export default router;

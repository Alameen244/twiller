import express from 'express';
import { createTweet, getAllTweets, likeTweet, retweetTweet, deleteTweet } from '../controllers/tweetController.js';
import { requestAudioOtp, verifyAudioOtp } from '../controllers/audioOtpController.js';
import { precheckAudioUpload, createAudioTweet } from '../controllers/audioTweetController.js';
import { translateTweets } from '../controllers/translationController.js';
import { uploadAudioSingle } from '../middlewares/audioUpload.middleware.js';
import { verifyFirebaseToken } from '../middlewares/firebaseAuth.middleware.js';
import { otpRateLimiter } from '../middlewares/otpRateLimiter.js';
import { translationRateLimiter } from '../middlewares/translationRateLimiter.js';

const router = express.Router();

router.post('/post', verifyFirebaseToken, createTweet);
router.get('/post', getAllTweets);

// Post translation: one batched call for all visible tweets, cached in MongoDB
router.post('/translate', verifyFirebaseToken, translationRateLimiter, translateTweets);

// Audio tweet: email OTP before any upload
router.post('/audio/otp/request', verifyFirebaseToken, otpRateLimiter, requestAudioOtp);
router.post('/audio/otp/verify', verifyFirebaseToken, verifyAudioOtp);

// Audio tweet: window + grant check, then receive the file, then create the tweet
router.post('/audio', verifyFirebaseToken, precheckAudioUpload, uploadAudioSingle, createAudioTweet);

router.post('/like/:tweetid', likeTweet);
router.post('/retweet/:tweetid', retweetTweet);
router.delete('/:tweetid', verifyFirebaseToken, deleteTweet);

export default router;

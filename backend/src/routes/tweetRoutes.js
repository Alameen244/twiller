import express from 'express';
import { createTweet, getAllTweets, likeTweet, retweetTweet, deleteTweet } from '../controllers/tweetController.js';
import { requestAudioOtp, verifyAudioOtp } from '../controllers/audioOtpController.js';
import { precheckAudioUpload, createAudioTweet } from '../controllers/audioTweetController.js';
import { translateTweets } from '../controllers/translationController.js';
import { uploadAudioSingle } from '../middlewares/audioUpload.middleware.js';
import { verifyFirebaseToken } from '../middlewares/firebaseAuth.middleware.js';
import {
  otpRateLimiter,
  translationRateLimiter,
  tweetReadLimiter,
  tweetCreateLimiter,
  tweetEngagementLimiter,
  tweetDeleteLimiter,
  audioUploadLimiter,
  otpVerifyLimiter,
} from '../middlewares/rateLimiters/index.js';

const router = express.Router();

router.post('/post', verifyFirebaseToken, tweetCreateLimiter, createTweet);
router.get('/post', tweetReadLimiter, getAllTweets);

// Post translation: one batched call for all visible tweets, cached in MongoDB
router.post('/translate', verifyFirebaseToken, translationRateLimiter, translateTweets);

// Audio tweet: email OTP before any upload
router.post('/audio/otp/request', verifyFirebaseToken, otpRateLimiter, requestAudioOtp);
router.post('/audio/otp/verify', verifyFirebaseToken, otpVerifyLimiter, verifyAudioOtp);

// Audio tweet: window + grant check, then receive the file, then create the tweet
router.post('/audio', verifyFirebaseToken, audioUploadLimiter, precheckAudioUpload, uploadAudioSingle, createAudioTweet);

router.post('/like/:tweetid', tweetEngagementLimiter, likeTweet);
router.post('/retweet/:tweetid', tweetEngagementLimiter, retweetTweet);
router.delete('/:tweetid', verifyFirebaseToken, tweetDeleteLimiter, deleteTweet);

export default router;

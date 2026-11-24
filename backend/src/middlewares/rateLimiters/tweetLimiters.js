import { buildRateLimiter } from './buildRateLimiter.js';

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const ONE_MINUTE = 60 * 1000;

export const tweetReadLimiter = buildRateLimiter({
  windowMs: ONE_MINUTE,
  max: 120,
  message: 'Too many feed requests. Please slow down.',
});

export const tweetCreateLimiter = buildRateLimiter({
  windowMs: FIFTEEN_MINUTES,
  max: 30,
  message: 'You are posting too quickly. Please wait a few minutes before posting again.',
});

export const tweetEngagementLimiter = buildRateLimiter({
  windowMs: ONE_MINUTE,
  max: 60,
  message: 'Too many like or retweet actions. Please slow down.',
});

export const tweetDeleteLimiter = buildRateLimiter({
  windowMs: FIFTEEN_MINUTES,
  max: 30,
  message: 'Too many delete requests. Please try again later.',
});

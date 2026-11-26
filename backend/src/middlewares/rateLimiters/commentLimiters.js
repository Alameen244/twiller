import { buildRateLimiter } from './buildRateLimiter.js';

const ONE_MINUTE = 60 * 1000;
const FIFTEEN_MINUTES = 15 * 60 * 1000;

export const commentReadLimiter = buildRateLimiter({
  windowMs: ONE_MINUTE,
  max: 120,
  message: 'Too many comment requests. Please slow down.',
});

export const commentCreateLimiter = buildRateLimiter({
  windowMs: ONE_MINUTE,
  max: 30,
  message: 'You are commenting too quickly. Please wait a moment.',
});

export const commentDeleteLimiter = buildRateLimiter({
  windowMs: FIFTEEN_MINUTES,
  max: 40,
  message: 'Too many comment delete requests. Please try again later.',
});

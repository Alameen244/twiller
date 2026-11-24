import { buildRateLimiter } from './buildRateLimiter.js';

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const ONE_MINUTE = 60 * 1000;

export const registerLimiter = buildRateLimiter({
  windowMs: FIFTEEN_MINUTES,
  max: 15,
  message: 'Too many registration attempts. Please try again after 15 minutes.',
});

export const userReadLimiter = buildRateLimiter({
  windowMs: ONE_MINUTE,
  max: 60,
  message: 'Too many user requests. Please slow down.',
});

export const userWriteLimiter = buildRateLimiter({
  windowMs: FIFTEEN_MINUTES,
  max: 25,
  message: 'Too many profile update requests. Please try again later.',
});

// Protects OTP verification endpoints against brute-force code guessing.
export const otpVerifyLimiter = buildRateLimiter({
  windowMs: FIFTEEN_MINUTES,
  max: 10,
  message: 'Too many verification attempts. Please try again after 15 minutes.',
});

export const passwordResetLimiter = buildRateLimiter({
  windowMs: FIFTEEN_MINUTES,
  max: 10,
  message: 'Too many password reset attempts. Please try again after 15 minutes.',
});

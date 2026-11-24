import { buildRateLimiter } from './buildRateLimiter.js';

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const ONE_MINUTE = 60 * 1000;

export const subscriptionReadLimiter = buildRateLimiter({
  windowMs: ONE_MINUTE,
  max: 60,
  message: 'Too many subscription requests. Please slow down.',
});

// Protects Razorpay order creation and Brevo invoice email sending.
export const paymentWriteLimiter = buildRateLimiter({
  windowMs: FIFTEEN_MINUTES,
  max: 15,
  message: 'Too many payment requests. Please try again after 15 minutes.',
});

import rateLimit from 'express-rate-limit';

const buildLimiter = (max, message) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message },
  });

// Every login calls this, so the limit is generous.
export const loginSessionRateLimiter = buildLimiter(
  20,
  'Too many login attempts. Please try again after 15 minutes.',
);

// Resending the email OTP is stricter (Brevo free plan: 300 emails a day).
export const loginOtpRateLimiter = buildLimiter(
  5,
  'Too many OTP requests. Please try again after 15 minutes.',
);

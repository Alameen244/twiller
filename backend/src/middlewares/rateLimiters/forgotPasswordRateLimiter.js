import rateLimit from 'express-rate-limit';

// Forgot-password: max 5 OTP requests per minute (per IP).
export const forgotPasswordRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many OTP requests. Please wait a minute and try again.',
  },
});

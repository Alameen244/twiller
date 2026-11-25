import { buildRateLimiter } from './buildRateLimiter.js';

const TEN_MINUTES = 10 * 60 * 1000;
const FIFTEEN_MINUTES = 15 * 60 * 1000;

// Email OTPs (Brevo): 20 requests per 10 minutes.
export const emailOtpRateLimiter = buildRateLimiter({
  windowMs: TEN_MINUTES,
  max: 20,
  message: 'Too many email OTP requests. Please try again after 10 minutes.',
});

// Mobile SMS OTPs (Twilio): 5 requests per 15 minutes.
export const mobileOtpRateLimiter = buildRateLimiter({
  windowMs: FIFTEEN_MINUTES,
  max: 5,
  message: 'Too many mobile OTP requests. Please try again after 15 minutes.',
});

// Language switch: English needs no OTP, French uses email OTP, all others use mobile OTP.
export const languageOtpRequestLimiter = (req, res, next) => {
  const language = req.body?.language;
  if (language === 'en') return next();
  if (language === 'fr') return emailOtpRateLimiter(req, res, next);
  return mobileOtpRateLimiter(req, res, next);
};

// Forgot password: route to email or mobile OTP limiter based on chosen recovery method.
export const forgotPasswordOtpLimiter = (req, res, next) => {
  const method = req.body?.method;
  if (method === 'email') return emailOtpRateLimiter(req, res, next);
  if (method === 'phone') return mobileOtpRateLimiter(req, res, next);
  return mobileOtpRateLimiter(req, res, next);
};

export const languageOtpVerifyLimiter = buildRateLimiter({
  windowMs: FIFTEEN_MINUTES,
  max: 20,
  message: 'Too many attempts. Please try again after 15 minutes.',
});

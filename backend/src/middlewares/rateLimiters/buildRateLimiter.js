import rateLimit from 'express-rate-limit';

/**
 * Shared factory for consistent express-rate-limit middleware configuration.
 */
export const buildRateLimiter = ({ windowMs, max, message }) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message,
    },
  });

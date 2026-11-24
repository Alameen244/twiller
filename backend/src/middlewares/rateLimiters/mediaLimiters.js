import { buildRateLimiter } from './buildRateLimiter.js';

const FIFTEEN_MINUTES = 15 * 60 * 1000;

// Protects Multer temp disk I/O and Cloudinary upload quotas.
export const imageUploadLimiter = buildRateLimiter({
  windowMs: FIFTEEN_MINUTES,
  max: 25,
  message: 'Too many image uploads. Please try again after 15 minutes.',
});

export const audioUploadLimiter = buildRateLimiter({
  windowMs: FIFTEEN_MINUTES,
  max: 15,
  message: 'Too many audio uploads. Please try again after 15 minutes.',
});

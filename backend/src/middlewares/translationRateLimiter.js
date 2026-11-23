import rateLimit from 'express-rate-limit';

export const translationRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many translation requests. Please slow down." }
});

import rateLimit from 'express-rate-limit';

// Reads: the frontend polls every ~20 s per open tab, so this is generous.
export const notificationReadLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests. Please slow down."
    }
});

// Writes: mark all read, change preference.
export const notificationWriteLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests. Please slow down."
    }
});

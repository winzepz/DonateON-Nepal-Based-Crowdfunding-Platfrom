import rateLimit from 'express-rate-limit';

export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 1000, // Limit each IP to 1000 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true, 
    legacyHeaders: false, 
});

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 300, 
    message: 'Too many API requests, please try again later',
});

export const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 attempts
    message: 'Too many login attempts from this IP, please try again after an hour',
});

export const paymentLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 mins
    max: 10, // Max 10 payment initiations per IP per 5 mins
    message: 'Too many payment requests, please try again later',
});

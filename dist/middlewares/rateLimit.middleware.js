import rateLimit from "express-rate-limit";
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Too many login attempts. Please wait 15 minutes.' },
});
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { error: 'Request limit exceeded.' },
});
//# sourceMappingURL=rateLimit.middleware.js.map
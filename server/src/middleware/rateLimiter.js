import rateLimit from 'express-rate-limit';

const createLimiter = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    message: { success: false, message },
    standardHeaders: true,
    legacyHeaders: false,
  });

// Strict: login & register (relaxed in development)
export const authLimiter = createLimiter(
  15 * 60 * 1000, // 15 minutes
  process.env.NODE_ENV === 'production' ? 10 : 100,
  'Too many authentication attempts. Please try again after 15 minutes.'
);

// Payment endpoints
export const paymentLimiter = createLimiter(
  10 * 60 * 1000, // 10 minutes
  20,
  'Too many payment requests. Please try again after 10 minutes.'
);

// OTP verification
export const otpLimiter = createLimiter(
  5 * 60 * 1000, // 5 minutes
  5,
  'Too many OTP attempts. Please try again after 5 minutes.'
);

// General API
export const generalLimiter = createLimiter(
  15 * 60 * 1000,
  200,
  'Too many requests from this IP. Please try again after 15 minutes.'
);

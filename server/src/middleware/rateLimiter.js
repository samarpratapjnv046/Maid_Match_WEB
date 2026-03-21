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

// OTP verification — 5 attempts per 5 minutes
export const otpLimiter = createLimiter(
  5 * 60 * 1000,
  5,
  'Too many OTP attempts. Please try again after 5 minutes.'
);

// Forgot-password OTP send — very strict: 3 requests per 15 minutes in production
export const forgotPasswordLimiter = createLimiter(
  15 * 60 * 1000,
  process.env.NODE_ENV === 'production' ? 3 : 20,
  'Too many password reset requests. Please try again after 15 minutes.'
);

// General API
export const generalLimiter = createLimiter(
  15 * 60 * 1000,
  200,
  'Too many requests from this IP. Please try again after 15 minutes.'
);

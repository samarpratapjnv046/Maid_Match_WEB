import express from 'express';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './src/routes/authRoutes.js';
import workerRoutes from './src/routes/workerRoutes.js';
import bookingRoutes from './src/routes/bookingRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';
import walletRoutes from './src/routes/walletRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import favoriteRoutes from './src/routes/favoriteRoutes.js';
import chatRoutes from './src/routes/chatRoutes.js';
import offerRoutes from './src/routes/offerRoutes.js';
import couponRoutes from './src/routes/couponRoutes.js';

import { globalErrorHandler } from './src/utils/errorHandler.js';
import { generalLimiter } from './src/middleware/rateLimiter.js';
import { AppError } from './src/utils/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// ─── Compression (gzip) ───────────────────────────────────────────────────────
// Skip for Razorpay webhook (raw body required); compress everything else
app.use(compression({ filter: (req) => req.path !== '/api/payments/webhook' }));

// ─── Security ────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
     origin: [
    "http://localhost:5173",
    "https://maid-match.vercel.app",
    "https://www.maidsaathi.in",
  ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);

app.get('/', (req, res) => {
  res.send('Backend is running 🚀');
});

// ─── Body Parsing ─────────────────────────────────────────────────────────────
// Raw body for Razorpay webhook signature verification
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ─── Sanitization ─────────────────────────────────────────────────────────────
app.use(mongoSanitize()); // Prevent NoSQL injection

// ─── Logging ──────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ─── Global Rate Limit ───────────────────────────────────────────────────────
app.use('/api/', generalLimiter);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ success: true, status: 'Server is running.', env: process.env.NODE_ENV, timestamp: new Date().toISOString() });
});

// ─── Cache headers for public read-only endpoints ────────────────────────────
// Workers list / profile: safe to cache for 60 s (stale-while-revalidate = 30 s extra)
// These are GET-only, authenticated endpoints are excluded by the browser's Vary: Authorization
app.use('/api/workers', (req, res, next) => {
  if (req.method === 'GET') {
    res.set('Cache-Control', 'private, max-age=60, stale-while-revalidate=30');
  }
  next();
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/coupons', couponRoutes);

// ─── Static Files (Production) ────────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  // ─── 404 Handler ────────────────────────────────────────────────────────────
  app.all('*', (req, _res, next) => {
    next(new AppError(`Route ${req.originalUrl} not found.`, 404));
  });
}

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(globalErrorHandler);

export default app;

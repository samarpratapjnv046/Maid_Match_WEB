import 'dotenv/config';
import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import connectDB from './src/config/db.js';
import logger from './src/utils/logger.js';
import { initChatSocket } from './src/socket/chatSocket.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ensure logs directory exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

// Connect to MongoDB then start server
connectDB().then(() => {
  const PORT = process.env.PORT || 5000;

  const httpServer = createServer(app);

  const io = new Server(httpServer, {
    cors: {
      origin: [
        'http://localhost:5173',
        'https://maid-match.vercel.app',
      ],
      credentials: true,
    },
  });

  initChatSocket(io);

  httpServer.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });

  // Graceful shutdown
  const shutdown = (signal) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    httpServer.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error('UNHANDLED REJECTION:', reason);
    shutdown('unhandledRejection');
  });
});

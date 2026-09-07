import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app';
import { connectDB } from './config/database';
import { config } from './config/config';
import { logger } from './utils/logger';

const httpServer = createServer(app);

// ── Socket.IO for real-time notifications ─────────────────────────────────────
export const io = new Server(httpServer, {
  cors: {
    origin: config.clientUrl,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  logger.debug(`Socket connected: ${socket.id}`);

  socket.on('join_user_room', (userId: string) => {
    socket.join(`user_${userId}`);
    logger.debug(`User ${userId} joined their room`);
  });

  socket.on('disconnect', () => {
    logger.debug(`Socket disconnected: ${socket.id}`);
  });
});

// ── Start Server ──────────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    await connectDB();

    httpServer.listen(config.port, () => {
      logger.info(`
╔═══════════════════════════════════════════════════╗
║  Ministry of Health Digital Health Platform       ║
║  Server running on port ${config.port.toString().padEnd(24)}║
║  Environment: ${config.nodeEnv.padEnd(35)}║
║  API Docs: http://localhost:${config.port}/api/docs${' '.repeat(21 - config.port.toString().length)}║
╚═══════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// ── Graceful Shutdown ─────────────────────────────────────────────────────────
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  httpServer.close(() => {
    logger.info('Server closed.');
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
  process.exit(1);
});

startServer();

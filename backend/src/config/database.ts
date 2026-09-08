import mongoose from 'mongoose';
import { config } from './config';
import { logger } from '../utils/logger';

export const connectDB = async (): Promise<void> => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  if (!config.mongoUri) {
    logger.error('MongoDB configuration error: MONGODB_URI environment variable is missing. Real MongoDB Atlas connection string is required in production.');
    if (config.nodeEnv === 'production') {
      process.exit(1);
    }
    return;
  }

  try {
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    // Never log raw connection string or credentials
    logger.info(`MongoDB Connected safely: Cluster host ${conn.connection.host}, database: ${conn.connection.name}`);
  } catch (error) {
    logger.error('MongoDB connection failed. Please verify Atlas network access (IP 0.0.0.0/0) and database credentials in hosting environment variables.');
    if (config.nodeEnv === 'production') {
      process.exit(1);
    }
  }
};

/**
 * Safe database connection health checker.
 * Returns connection state without exposing any credentials, cluster hostnames, or secrets.
 */
export const getDatabaseHealth = (): {
  status: 'connected' | 'disconnected' | 'connecting';
  connected: boolean;
} => {
  const state = mongoose.connection.readyState;
  if (state === 1) {
    return { status: 'connected', connected: true };
  } else if (state === 2) {
    return { status: 'connecting', connected: false };
  } else {
    return { status: 'disconnected', connected: false };
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnected successfully.');
});


import mongoose from 'mongoose';
import { config } from './env';

export const connectDB = async (): Promise<void> => {
  try {
    if (!config.mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    const conn = await mongoose.connect(config.mongoUri);
    console.log(`[Database] MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown database error';
    console.error(`[Database Error] Failed to connect to MongoDB: ${message}`);
    throw error;
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('[Database] MongoDB disconnected successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error during disconnect';
    console.error(`[Database Error] Failed to disconnect from MongoDB: ${message}`);
  }
};

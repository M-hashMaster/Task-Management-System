import app from './app';
import { config } from './config/env';
import { connectDB, disconnectDB } from './config/db';

const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDB();

    const server = app.listen(config.port, () => {
      console.log(`[Server] Task Management API is running on http://localhost:${config.port}`);
      console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    const shutdown = async (signal: string): Promise<void> => {
      console.log(`\n[Server] Received ${signal}. Gracefully shutting down...`);
      server.close(async () => {
        await disconnectDB();
        console.log('[Server] Process terminated cleanly');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown startup error';
    console.error(`[Server Fatal] Failed to start server: ${message}`);
    process.exit(1);
  }
};

startServer();

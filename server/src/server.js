const app = require('./app');
const { PORT, NODE_ENV } = require('./config/env');
const { connectDB, disconnectDB } = require('./config/db');

/**
 * SERVER STARTUP
 * 
 * This is the entry point of our backend application.
 * It does three things in order:
 * 1. Connects to the PostgreSQL database
 * 2. Starts the Express HTTP server
 * 3. Sets up graceful shutdown handlers
 */
async function startServer() {
  try {
    // 1. Connect to database first (if this fails, no point starting the server)
    await connectDB();

    // 2. Start the HTTP server
    const server = app.listen(PORT, () => {
      console.log(`\n🕰️  Virtual Time Capsule Server`);
      console.log(`   Environment : ${NODE_ENV}`);
      console.log(`   Port        : ${PORT}`);
      console.log(`   URL         : http://localhost:${PORT}`);
      console.log(`   Health      : http://localhost:${PORT}/api/health`);
      console.log(`   Ready at    : ${new Date().toLocaleString()}\n`);
    });

    // 3. Graceful shutdown handlers
    // When the server is stopped (Ctrl+C or process kill), clean up properly
    const gracefulShutdown = async (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      
      server.close(async () => {
        await disconnectDB();
        console.log('👋 Server shut down complete.');
        process.exit(0);
      });

      // Force shutdown if graceful shutdown takes too long (10 seconds)
      setTimeout(() => {
        console.error('⚠️  Forced shutdown - graceful shutdown timed out');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle unhandled promise rejections (programming errors)
    process.on('unhandledRejection', (err) => {
      console.error('🔴 UNHANDLED REJECTION:', err.message);
      server.close(() => process.exit(1));
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();

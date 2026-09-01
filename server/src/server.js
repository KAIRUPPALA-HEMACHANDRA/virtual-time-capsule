const app = require('./app');
const http = require('http');
const { initializeSocket } = require('./config/socket');
// const { PORT, NODE_ENV } = require('./config/env');
const { PORT, NODE_ENV, CLIENT_URL } = require('./config/env');
const { connectDB, disconnectDB } = require('./config/db');
const { startQueue, stopQueue } = require('./config/queue');
const { registerWorkers } = require('./jobs/capsuleJobs');
const { registerLegacyWorker } = require('./jobs/legacyJobs');


/**
 * SERVER STARTUP — with Job Queue
 * 
 * Startup order:
 * 1. Connect to PostgreSQL database
 * 2. Start the pg-boss job queue
 * 3. Register job workers (capsule unlock, etc.)
 * 4. Start the Express HTTP server
 * 5. Set up graceful shutdown handlers
 */
async function startServer() {
  try {
    // 1. Connect to database
    await connectDB();

    // 2. Start the job queue
    const boss = await startQueue();

    // 3. Register workers
    await registerWorkers(boss);
    await registerLegacyWorker(boss);

    // 4. Start HTTP server
    const server = http.createServer(app);
    initializeSocket(server, CLIENT_URL);

    server.listen(PORT, () => {      console.log(`\n🕰️  Virtual Time Capsule Server`);
      console.log(`   Environment : ${NODE_ENV}`);
      console.log(`   Port        : ${PORT}`);
      console.log(`   URL         : http://localhost:${PORT}`);
      console.log(`   Health      : http://localhost:${PORT}/api/health`);
      console.log(`   Queue       : pg-boss (PostgreSQL-backed)`);
      console.log(`   Ready at    : ${new Date().toLocaleString()}\n`);
    });

    // 5. Graceful shutdown
    const gracefulShutdown = async (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);

      server.close(async () => {
        await stopQueue();
        await disconnectDB();
        console.log('👋 Server shut down complete.');
        process.exit(0);
      });

      setTimeout(() => {
        console.error('⚠️  Forced shutdown - graceful shutdown timed out');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

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

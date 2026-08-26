// const PgBoss = require('pg-boss');
const { PgBoss } = require('pg-boss');
const { DATABASE_URL } = require('./env');

/**
 * Job Queue Configuration (pg-boss)
 * 
 * pg-boss uses your existing PostgreSQL database as its job queue.
 * It automatically creates its own tables (prefixed with "pgboss.")
 * to store pending, active, and completed jobs.
 * 
 * HOW IT WORKS:
 * 1. When a capsule is created, we "send" a delayed job to the queue
 *    with startAfter set to the capsule's unlock date
 * 2. pg-boss stores this job in PostgreSQL with the scheduled time
 * 3. pg-boss continuously polls the database for jobs that are due
 * 4. When the unlock time arrives, pg-boss triggers our worker function
 * 5. The worker unlocks the capsule and sends a notification
 * 
 * Even if the server restarts, jobs survive because they're in the database.
 * This is why we don't use setTimeout — it would vanish on restart.
 */

let boss = null;

async function startQueue() {
  boss = new PgBoss({
    connectionString: DATABASE_URL,
    // How often pg-boss checks for new jobs (in seconds)
    monitorStateIntervalSeconds: 10,
    // Delete completed jobs after 7 days to keep the DB clean
    deleteAfterDays: 7,
    // Retry failed jobs up to 3 times
    retryLimit: 3,
    retryDelay: 60, // Wait 60 seconds between retries
  });

  // Log queue events
  boss.on('error', (error) => {
    console.error('🔴 Queue error:', error.message);
  });

  await boss.start();
  console.log('✅ Job queue started (pg-boss)');

  return boss;
}

function getQueue() {
  if (!boss) {
    throw new Error('Queue not initialized. Call startQueue() first.');
  }
  return boss;
}

async function stopQueue() {
  if (boss) {
    await boss.stop();
    console.log('📦 Job queue stopped');
  }
}

module.exports = { startQueue, getQueue, stopQueue };

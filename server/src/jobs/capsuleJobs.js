const { prisma } = require('../config/db');
const { sendCapsuleUnlockEmail } = require('../utils/emailService');

/**
 * Capsule Jobs
 * 
 * This file defines the job WORKERS — the functions that run
 * when a scheduled job's time arrives.
 * 
 * JOB: 'capsule-unlock'
 * TRIGGER: When the capsule's unlock date/time is reached
 * ACTION:
 *   1. Find the capsule in the database
 *   2. Change its status from LOCKED to UNLOCKED
 *   3. Send an email notification to the creator
 *   4. Log the event
 * 
 * pg-boss calls this function automatically. If it fails,
 * pg-boss retries up to 3 times (configured in queue.js).
 */

// Job name constants — prevents typos
const JOBS = {
  CAPSULE_UNLOCK: 'capsule-unlock',
};

/**
 * Register all job workers with the queue
 */
async function registerWorkers(boss) {
  // Register the capsule-unlock worker
  await boss.createQueue(JOBS.CAPSULE_UNLOCK);
  await boss.work(JOBS.CAPSULE_UNLOCK, { newJobCheckIntervalSeconds: 30 }, handleCapsuleUnlock);
  console.log('   → Registered worker: capsule-unlock');
}

/**
 * Handle capsule unlock job
 * This runs when a capsule's unlock time arrives
 */
async function handleCapsuleUnlock(job) {
  const { capsuleId } = job.data;

  console.log(`\n🔓 Processing unlock job for capsule: ${capsuleId}`);

  try {
    // 1. Find the capsule with its creator info
    const capsule = await prisma.capsule.findUnique({
      where: { id: capsuleId },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Capsule might have been deleted since the job was scheduled
    if (!capsule) {
      console.log(`   ⚠️ Capsule ${capsuleId} not found (may have been deleted). Skipping.`);
      return;
    }

    // Capsule might already be unlocked (if user viewed it after unlock time)
    if (capsule.status !== 'LOCKED') {
      console.log(`   ⚠️ Capsule ${capsuleId} is already ${capsule.status}. Skipping.`);
      return;
    }

    // 2. Update status to UNLOCKED
    await prisma.capsule.update({
      where: { id: capsuleId },
      data: { status: 'UNLOCKED' },
    });

    console.log(`   ✅ Capsule "${capsule.title}" unlocked successfully!`);

    // 3. Send notification email to the creator
    await sendCapsuleUnlockEmail(capsule.creator, capsule);

    console.log(`   📧 Notification sent to ${capsule.creator.email}`);
  } catch (error) {
    console.error(`   🔴 Failed to unlock capsule ${capsuleId}:`, error.message);
    // Throwing the error makes pg-boss retry the job
    throw error;
  }
}

/**
 * Schedule a capsule unlock job
 * Called when a new capsule is created
 */
async function scheduleCapsuleUnlock(boss, capsuleId, unlockAt) {
  const jobId = `unlock-${capsuleId}`; // Unique job ID tied to the capsule

  await boss.send(
    JOBS.CAPSULE_UNLOCK,        // Job name
    { capsuleId },               // Job data (what the worker receives)
    {
      id: jobId,                 // Unique ID so we can cancel it later
      startAfter: new Date(unlockAt), // When to run the job
      retryLimit: 3,             // Retry up to 3 times if it fails
      retryDelay: 60,            // Wait 60 seconds between retries
    }
  );

  console.log(`⏰ Scheduled unlock for capsule ${capsuleId} at ${new Date(unlockAt).toLocaleString()}`);
}

/**
 * Cancel a scheduled capsule unlock job
 * Called when a capsule is deleted or its unlock date is changed
 */
async function cancelCapsuleUnlock(boss, capsuleId) {
  const jobId = `unlock-${capsuleId}`;

  try {
    await boss.cancel(jobId);
    console.log(`🚫 Cancelled unlock job for capsule ${capsuleId}`);
  } catch {
    // Job might not exist (already completed or never scheduled)
    // That's fine — we just wanted to make sure it's cancelled
  }
}

module.exports = {
  JOBS,
  registerWorkers,
  scheduleCapsuleUnlock,
  cancelCapsuleUnlock,
};

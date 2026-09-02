const { prisma } = require('../config/db');
const { sendCapsuleUnlockEmail, sendEmail } = require('../utils/emailService');
const { createNotification } = require('../services/notificationService');

const JOBS = {
  CAPSULE_UNLOCK: 'capsule-unlock',
};

async function registerWorkers(boss) {
  await boss.createQueue(JOBS.CAPSULE_UNLOCK);
  await boss.work(JOBS.CAPSULE_UNLOCK, { newJobCheckIntervalSeconds: 30 }, handleCapsuleUnlock);
  console.log('   → Registered worker: capsule-unlock');
}

async function handleCapsuleUnlock(job) {
  const { capsuleId } = job.data;

  console.log(`\n🔓 Processing unlock job for capsule: ${capsuleId}`);

  try {
    const capsule = await prisma.capsule.findUnique({
      where: { id: capsuleId },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        recipients: true,
      },
    });

    if (!capsule) {
      console.log(`   ⚠️ Capsule ${capsuleId} not found. Skipping.`);
      return;
    }

    if (capsule.status !== 'LOCKED') {
      console.log(`   ⚠️ Capsule ${capsuleId} is already ${capsule.status}. Skipping.`);
      return;
    }

    if (capsule.isGeoLocked) {
      console.log(`   📍 Capsule ${capsuleId} is geo-locked. Skipping auto-unlock.`);
      return;
    }

    if (capsule.prerequisiteId) {
      const prereq = await prisma.capsule.findUnique({
        where: { id: capsule.prerequisiteId },
        select: { status: true },
      });
      if (prereq && !['UNLOCKED', 'OPENED'].includes(prereq.status)) {
        console.log(`   🔗 Prerequisite not met for capsule ${capsuleId}. Skipping.`);
        return;
      }
    }

    // Unlock the capsule
    await prisma.capsule.update({
      where: { id: capsuleId },
      data: { status: 'UNLOCKED' },
    });

    console.log(`   ✅ Capsule "${capsule.title}" unlocked successfully!`);

    // Create real-time notification for the creator
    await createNotification({
      userId: capsule.creator.id,
      type: 'capsule_unlocked',
      title: '🔓 Capsule Unlocked!',
      message: `Your capsule "${capsule.title}" is now open and ready to read.`,
      capsuleId: capsule.id,
    });

    // Notify creator via email
    await sendCapsuleUnlockEmail(capsule.creator, capsule);
    console.log(`   📧 Notification sent to creator: ${capsule.creator.email}`);

    // Notify recipients
    for (const recipient of capsule.recipients) {
      if (!recipient.notified) {
        await sendEmail({
          to: recipient.email,
          subject: `🕰️ A time capsule from ${capsule.creator.name} has been opened for you!`,
          text: `"${capsule.title}" — a time capsule addressed to you has just unlocked.`,
          html: `
            <div style="font-family: system-ui, sans-serif; max-width: 500px; margin: 0 auto; background: #0a0a1a; color: #e8e8f0; padding: 2rem; border-radius: 12px;">
              <h1 style="text-align: center;">🕰️ A Capsule For You!</h1>
              <p style="text-align: center; color: #9ca3af;">${capsule.creator.name} sent you a time capsule.</p>
              <div style="background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0;">
                <h2 style="color: #a78bfa;">${capsule.title}</h2>
              </div>
            </div>
          `,
        });

        await prisma.recipient.update({
          where: { id: recipient.id },
          data: { notified: true },
        });

        console.log(`   📧 Notification sent to recipient: ${recipient.email}`);
      }
    }
  } catch (error) {
    console.error(`   🔴 Failed to unlock capsule ${capsuleId}:`, error.message);
    throw error;
  }
}

async function scheduleCapsuleUnlock(boss, capsuleId, unlockAt) {
  // const jobId = `unlock-${capsuleId}`;
  const jobId = capsuleId;
  await boss.send(JOBS.CAPSULE_UNLOCK, { capsuleId }, {
    id: jobId,
    startAfter: new Date(unlockAt),
    retryLimit: 3,
    retryDelay: 60,
  });
  console.log(`⏰ Scheduled unlock for capsule ${capsuleId} at ${new Date(unlockAt).toLocaleString()}`);
}

async function cancelCapsuleUnlock(boss, capsuleId) {
  // const jobId = `unlock-${capsuleId}`;
  const jobId = capsuleId;
  try { await boss.cancel(jobId); console.log(`🚫 Cancelled unlock job for capsule ${capsuleId}`); } catch {}
}

module.exports = { JOBS, registerWorkers, scheduleCapsuleUnlock, cancelCapsuleUnlock };

const { prisma } = require('../config/db');
const { sendEmail } = require('../utils/emailService');

/**
 * Legacy Capsule Job
 * 
 * Runs every 24 hours and checks if any users have been inactive
 * for their specified legacy period. If so, their legacy capsules
 * are unlocked and recipients are notified.
 * 
 * FLOW:
 * 1. Find all LOCKED legacy capsules
 * 2. For each, check if the creator has been inactive for legacyDays
 * 3. If inactive long enough, unlock the capsule and notify recipients
 */

const JOBS = {
  LEGACY_CHECK: 'legacy-check',
};

async function registerLegacyWorker(boss) {
  await boss.createQueue(JOBS.LEGACY_CHECK);

  // Schedule recurring job — runs every 24 hours
  const schedule = '0 0 * * *'; // Midnight every day (cron syntax)
  await boss.schedule(JOBS.LEGACY_CHECK, schedule, {});

  await boss.work(JOBS.LEGACY_CHECK, { newJobCheckIntervalSeconds: 60 }, handleLegacyCheck);
  console.log('   → Registered worker: legacy-check (runs daily)');
}

async function handleLegacyCheck() {
  console.log('\n🕰️ Running legacy capsule check...');

  try {
    // Find all locked legacy capsules with their creators
    const legacyCapsules = await prisma.capsule.findMany({
      where: {
        isLegacy: true,
        status: 'LOCKED',
        legacyDays: { not: null },
      },
      include: {
        creator: { select: { id: true, name: true, email: true, lastActiveAt: true } },
        recipients: true,
      },
    });

    if (legacyCapsules.length === 0) {
      console.log('   No legacy capsules to check.');
      return;
    }

    console.log(`   Found ${legacyCapsules.length} legacy capsule(s) to check.`);

    const now = new Date();

    for (const capsule of legacyCapsules) {
      const lastActive = capsule.creator.lastActiveAt;

      // If user has never been tracked, skip
      if (!lastActive) {
        console.log(`   ⏭️ "${capsule.title}" — creator has no activity record yet.`);
        continue;
      }

      // Calculate days since last activity
      const daysSinceActive = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

      if (daysSinceActive >= capsule.legacyDays) {
        // User has been inactive long enough — unlock the capsule
        console.log(`   🔓 "${capsule.title}" — creator inactive for ${daysSinceActive} days (threshold: ${capsule.legacyDays} days). Unlocking...`);

        await prisma.capsule.update({
          where: { id: capsule.id },
          data: { status: 'UNLOCKED' },
        });

        // Notify recipients
        for (const recipient of capsule.recipients) {
          if (!recipient.notified) {
            await sendEmail({
              to: recipient.email,
              subject: `🕰️ A legacy time capsule from ${capsule.creator.name} has been opened`,
              text: `"${capsule.title}" — a legacy capsule from ${capsule.creator.name} has been unlocked because they have been inactive for ${daysSinceActive} days.`,
              html: `
                <div style="font-family: system-ui, sans-serif; max-width: 500px; margin: 0 auto; background: #0a0a1a; color: #e8e8f0; padding: 2rem; border-radius: 12px;">
                  <h1 style="text-align: center;">🕰️ Legacy Capsule</h1>
                  <p style="text-align: center; color: #9ca3af;">A message preserved for you by ${capsule.creator.name}</p>
                  <div style="background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0;">
                    <h2 style="color: #a78bfa;">${capsule.title}</h2>
                    <p style="color: #9ca3af; font-size: 0.85rem;">This legacy capsule was triggered after ${daysSinceActive} days of inactivity.</p>
                  </div>
                </div>
              `,
            });

            await prisma.recipient.update({
              where: { id: recipient.id },
              data: { notified: true },
            });
          }
        }

        // Also notify the creator
        await sendEmail({
          to: capsule.creator.email,
          subject: `🕰️ Your legacy capsule "${capsule.title}" has been delivered`,
          text: `Your legacy capsule "${capsule.title}" has been delivered to its recipients because you were inactive for ${daysSinceActive} days. If this was unintentional, log in to manage your capsules.`,
        });

        console.log(`   ✅ Legacy capsule "${capsule.title}" unlocked and notifications sent.`);
      } else {
        console.log(`   ⏳ "${capsule.title}" — creator active ${daysSinceActive} days ago (threshold: ${capsule.legacyDays} days). Not yet.`);
      }
    }
  } catch (error) {
    console.error('   🔴 Legacy check failed:', error.message);
    throw error;
  }
}

module.exports = { registerLegacyWorker };

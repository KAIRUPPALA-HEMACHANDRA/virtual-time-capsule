const fs = require('fs');
const path = require('path');
const { prisma } = require('../config/db');
const AppError = require('../utils/AppError');
const { getQueue } = require('../config/queue');
const { scheduleCapsuleUnlock, cancelCapsuleUnlock } = require('../jobs/capsuleJobs');
const { generateContentHash } = require('../utils/hashUtils');
const { analyzeSentiment } = require('../utils/sentimentUtils');
const { generateShareToken } = require('../utils/shareUtils');

// ============================================
// CREATE
// ============================================
async function createCapsule(userId, data, files = []) {
  const now = new Date();

  // Generate proof-of-creation hash BEFORE saving
  const contentHash = generateContentHash(data.title, data.content || '', now);
  
  const sentiment = analyzeSentiment(data.content || '');

  const capsule = await prisma.capsule.create({
    data: {
      title: data.title,
      content: data.content || null,
      unlockAt: new Date(data.unlockAt),
      isPublic: data.isPublic === 'true' || data.isPublic === true,
      creatorId: userId,
      isEncrypted: data.isEncrypted === 'true' || data.isEncrypted === true,
      isAnonymous: data.isAnonymous === 'true' || data.isAnonymous === true,
      selfDestructAfterRead: data.selfDestructAfterRead === 'true' || data.selfDestructAfterRead === true,
      shareToken: generateShareToken(),
      isGeoLocked: data.isGeoLocked === 'true' || data.isGeoLocked === true,
      latitude: data.latitude ? parseFloat(data.latitude) : null,
      longitude: data.longitude ? parseFloat(data.longitude) : null,
      geoRadius: data.geoRadius ? parseInt(data.geoRadius) : 100,
      prerequisiteId: data.prerequisiteId || null,
      isLegacy: data.isLegacy === 'true' || data.isLegacy === true,
      legacyDays: data.legacyDays ? parseInt(data.legacyDays) : null,
      contentHash,
      sentimentScore: sentiment.score,
      sentimentLabel: sentiment.label,
      createdAt: now, // Use the same timestamp we hashed
      recipients: {
        create: (data.recipients ? JSON.parse(data.recipients) : []).map((email) => ({
          email,
        })),
      },
      attachments: {
        create: files.map((file) => ({
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: `/uploads/${file.filename}`,
        })),
      },
    },
    include: {
      creator: { select: { id: true, name: true, email: true } },
      attachments: true,
    },
  });

  // Schedule unlock job
  // Only schedule time-based unlock for non-legacy capsules
  if (!capsule.isLegacy) {
    try {
      const boss = getQueue();
      await scheduleCapsuleUnlock(boss, capsule.id, capsule.unlockAt);
    } catch (error) {
      console.error('⚠️ Failed to schedule unlock job:', error.message);
    }
  }
  // } catch (error) {
    // console.error('⚠️ Failed to schedule unlock job:', error.message);
  // }
  return capsule;
}

// ============================================
// GET ALL CAPSULES
// ============================================
async function getUserCapsules(userId) {
  await autoUnlockCapsules(userId);

  const capsules = await prisma.capsule.findMany({
    where: { creatorId: userId },
    orderBy: { createdAt: 'desc' },
    include: {
      creator: { select: { id: true, name: true } },
      attachments: { select: { id: true, mimetype: true, originalName: true } },
    },
  });

  return capsules.map((capsule) => {
    if (capsule.status === 'LOCKED') {
      return {
        ...capsule,
        content: null,
        attachments: capsule.attachments.map((a) => ({ id: a.id, mimetype: a.mimetype })),
        isLocked: true,
        timeRemaining: getTimeRemaining(capsule.unlockAt),
        attachmentCount: capsule.attachments.length,
      };
    }
    return {
      ...capsule,
      isLocked: false,
      timeRemaining: null,
      attachmentCount: capsule.attachments.length,
    };
  });
}

// ============================================
// GET SINGLE CAPSULE
// ============================================
async function getCapsuleById(capsuleId, userId) {
  const capsule = await prisma.capsule.findUnique({
    where: { id: capsuleId },
    include: {
      creator: { select: { id: true, name: true, email: true } },
      attachments: true,
      prerequisite: { select: { id: true, title: true, status: true } },
      recipients: true,
    },
  });

  if (!capsule) throw new AppError('Capsule not found', 404);
  if (capsule.creatorId !== userId && !capsule.isPublic) {
    throw new AppError('You do not have permission to view this capsule', 403);
  }

  const prerequisiteMet = !capsule.prerequisiteId || 
    (capsule.prerequisite && ['UNLOCKED', 'OPENED'].includes(capsule.prerequisite.status));
  
  if (capsule.status === 'LOCKED' && new Date() >= capsule.unlockAt && !capsule.isGeoLocked && prerequisiteMet) {    
    const updated = await prisma.capsule.update({
      where: { id: capsuleId },
      data: { status: 'UNLOCKED' },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        attachments: true,
        recipients: true,
      },
    });
    return { ...updated, isLocked: false, timeRemaining: null, attachmentCount: updated.attachments.length };
  }

  if (capsule.status === 'LOCKED') {
    return {
      ...capsule,
      content: capsule.creatorId === userId ? capsule.content : null,
      attachments: capsule.creatorId === userId
        ? capsule.attachments
        : capsule.attachments.map((a) => ({ id: a.id, mimetype: a.mimetype })),
      isLocked: true,
      timeRemaining: getTimeRemaining(capsule.unlockAt),
      attachmentCount: capsule.attachments.length,
    };
  }

  if (capsule.status === 'UNLOCKED' && capsule.creatorId === userId && !capsule.selfDestructAfterRead) {
    const opened = await prisma.capsule.update({
      where: { id: capsuleId },
      data: { status: 'OPENED', openedAt: new Date() },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        attachments: true,
        recipients: true,
      },
    });
    return { ...opened, isLocked: false, timeRemaining: null, attachmentCount: opened.attachments.length };
  }

  return { ...capsule, isLocked: false, timeRemaining: null, attachmentCount: capsule.attachments.length };
}

// ============================================
// UPDATE
// ============================================
async function updateCapsule(capsuleId, userId, data) {
  const capsule = await prisma.capsule.findUnique({ where: { id: capsuleId } });

  if (!capsule) throw new AppError('Capsule not found', 404);
  if (capsule.creatorId !== userId) throw new AppError('You can only edit your own capsules', 403);
  if (capsule.status !== 'LOCKED') throw new AppError('Cannot edit a capsule that has already been unlocked or opened', 400);

  const updateData = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.content !== undefined) updateData.content = data.content;
  if (data.unlockAt !== undefined) updateData.unlockAt = new Date(data.unlockAt);
  if (data.isPublic !== undefined) updateData.isPublic = data.isPublic === 'true' || data.isPublic === true;

  // Regenerate hash if title or content changed
  if (data.title !== undefined || data.content !== undefined) {
    const newTitle = data.title !== undefined ? data.title : capsule.title;
    const newContent = data.content !== undefined ? data.content : capsule.content;
    updateData.contentHash = generateContentHash(newTitle, newContent || '', capsule.createdAt);
  }

  const updated = await prisma.capsule.update({
    where: { id: capsuleId },
    data: updateData,
    include: {
      creator: { select: { id: true, name: true, email: true } },
      attachments: true,
    },
  });

  if (data.unlockAt !== undefined) {
    try {
      const boss = getQueue();
      await cancelCapsuleUnlock(boss, capsuleId);
      await scheduleCapsuleUnlock(boss, capsuleId, updated.unlockAt);
    } catch (error) {
      console.error('⚠️ Failed to reschedule unlock job:', error.message);
    }
  }

  return updated;
}

// ============================================
// DELETE
// ============================================
async function deleteCapsule(capsuleId, userId) {
  const capsule = await prisma.capsule.findUnique({
    where: { id: capsuleId },
    include: { attachments: true },
  });

  if (!capsule) throw new AppError('Capsule not found', 404);
  if (capsule.creatorId !== userId) throw new AppError('You can only delete your own capsules', 403);

  for (const attachment of capsule.attachments) {
    const filePath = path.join(__dirname, '../../uploads', attachment.filename);
    try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch {}
  }

  try {
    const boss = getQueue();
    await cancelCapsuleUnlock(boss, capsuleId);
  } catch (error) {
    console.error('⚠️ Failed to cancel unlock job:', error.message);
  }

  await prisma.capsule.delete({ where: { id: capsuleId } });
  return { message: 'Capsule deleted successfully' };
}

// ============================================
// DELETE ATTACHMENT
// ============================================
async function deleteAttachment(attachmentId, userId) {
  const attachment = await prisma.attachment.findUnique({
    where: { id: attachmentId },
    include: { capsule: true },
  });

  if (!attachment) throw new AppError('Attachment not found', 404);
  if (attachment.capsule.creatorId !== userId) throw new AppError('You can only delete your own attachments', 403);
  if (attachment.capsule.status !== 'LOCKED') throw new AppError('Cannot modify attachments of an opened capsule', 400);

  const filePath = path.join(__dirname, '../../uploads', attachment.filename);
  try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch {}

  await prisma.attachment.delete({ where: { id: attachmentId } });
  return { message: 'Attachment deleted' };
}

// ============================================
// HELPERS
// ============================================

async function autoUnlockCapsules(userId) {
  const capsulesToUnlock = await prisma.capsule.findMany({
    where: {
      creatorId: userId,
      status: 'LOCKED',
      unlockAt: { lte: new Date() },
      isGeoLocked: false,
      prerequisiteId: null,
    },
    select: { id: true, title: true, content: true, createdAt: true },
  });

  console.log(`🔍 Auto-unlock check: found ${capsulesToUnlock.length} capsules to unlock`);

  if (capsulesToUnlock.length === 0) return;

  await prisma.capsule.updateMany({
    where: { id: { in: capsulesToUnlock.map((c) => c.id) } },
    data: { status: 'UNLOCKED' },
  });

  const { createNotification } = require('../services/notificationService');
  const { sendCapsuleUnlockEmail, sendEmail } = require('../utils/emailService');

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  });

  for (const capsule of capsulesToUnlock) {
    // Send notification
    try {
      await createNotification({
        userId,
        type: 'capsule_unlocked',
        title: '🔓 Capsule Unlocked!',
        message: `Your capsule "${capsule.title}" is now open and ready to read.`,
        capsuleId: capsule.id,
      });
      console.log(`🔔 Notification created for "${capsule.title}"`);
    } catch (err) {
      console.error(`❌ Notification failed for "${capsule.title}":`, err.message);
    }

    // Email creator
    try {
      await sendCapsuleUnlockEmail(user, capsule);
      console.log(`📧 Creator email sent to ${user.email}`);
    } catch (err) {
      console.error(`❌ Creator email failed:`, err.message);
    }

    // Email recipients
    try {
      const recipients = await prisma.recipient.findMany({
        where: { capsuleId: capsule.id, notified: false },
      });

      console.log(`📬 Found ${recipients.length} recipients for "${capsule.title}"`);

      const fullCapsule = await prisma.capsule.findUnique({
        where: { id: capsule.id },
        select: { shareToken: true },
      });

      for (const recipient of recipients) {
        try {
          await sendEmail({
            to: recipient.email,
            subject: `🕰️ A time capsule has been opened for you!`,
            text: `"${capsule.title}" — a capsule for you has just unlocked.`,
            html: `
              <div style="font-family: system-ui; max-width: 500px; margin: 0 auto; background: #0a0a1a; color: #e8e8f0; padding: 2rem; border-radius: 12px;">
                <h1 style="text-align: center;">🕰️ A Capsule For You!</h1>
                <div style="background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 8px; margin: 1rem 0;">
                  <h2 style="color: #a78bfa;">${capsule.title}</h2>
                </div>
                ${fullCapsule?.shareToken ? `<p style="text-align:center;"><a href="https://virtual-time-capsule-ten.vercel.app/shared/${fullCapsule.shareToken}" style="color:#a78bfa;">Click here to view</a></p>` : ''}
              </div>
            `,
          });

          await prisma.recipient.update({
            where: { id: recipient.id },
            data: { notified: true },
          });

          console.log(`📧 Recipient email sent to ${recipient.email}`);
        } catch (err) {
          console.error(`❌ Recipient email failed for ${recipient.email}:`, err.message);
        }
      }
    } catch (err) {
      console.error(`❌ Recipients lookup failed:`, err.message);
    }
  }
}

// async function autoUnlockCapsules(userId) {
//   const capsulesToUnlock = await prisma.capsule.findMany({
//     where: {
//       creatorId: userId,
//       status: 'LOCKED',
//       unlockAt: { lte: new Date() },
//       isGeoLocked: false,
//       prerequisiteId: null,
//     },
//     select: { id: true, title: true, content: true, createdAt: true },
//   });
//   console.log(`🔍 Auto-unlock check: found ${capsulesToUnlock.length} capsules to unlock`);
//   if (capsulesToUnlock.length === 0) return;

//   await prisma.capsule.updateMany({
//     where: { id: { in: capsulesToUnlock.map((c) => c.id) } },
//     data: { status: 'UNLOCKED' },
//   });

//   const { createNotification } = require('../services/notificationService');
//   const { sendCapsuleUnlockEmail } = require('../utils/emailService');

//   const user = await prisma.user.findUnique({
//     where: { id: userId },
//     select: { id: true, name: true, email: true },
//   });

//   for (const capsule of capsulesToUnlock) {
//     try {
//       await createNotification({
//         userId,
//         type: 'capsule_unlocked',
//         title: '🔓 Capsule Unlocked!',
//         message: `Your capsule "${capsule.title}" is now open and ready to read.`,
//         capsuleId: capsule.id,
//       });
//       await sendCapsuleUnlockEmail(user, capsule);

//       // Notify recipients via email
//       const recipients = await prisma.recipient.findMany({
//         where: { capsuleId: capsule.id, notified: false },
//       });

//       const { sendEmail } = require('../utils/emailService');
//       for (const recipient of recipients) {
//         try {
//           const shareToken = await prisma.capsule.findUnique({
//             where: { id: capsule.id },
//             select: { shareToken: true },
//           });

//           await sendEmail({
//             to: recipient.email,
//             subject: `🕰️ A time capsule has been opened for you!`,
//             text: `"${capsule.title}" — a time capsule addressed to you has just unlocked.`,
//             html: `
//               <div style="font-family: system-ui; max-width: 500px; margin: 0 auto; background: #0a0a1a; color: #e8e8f0; padding: 2rem; border-radius: 12px;">
//                 <h1 style="text-align: center;">🕰️ A Capsule For You!</h1>
//                 <div style="background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 8px; margin: 1rem 0;">
//                   <h2 style="color: #a78bfa;">${capsule.title}</h2>
//                 </div>
//                 ${shareToken?.shareToken ? `<p style="text-align:center;"><a href="http://localhost:5173/shared/${shareToken.shareToken}" style="color:#a78bfa;">Click here to view</a></p>` : ''}
//               </div>
//             `,
//           });

//           await prisma.recipient.update({
//             where: { id: recipient.id },
//             data: { notified: true },
//           });
//         } catch {}
//       }
//     } catch (err) { console.error('Auto-unlock error:', err.message); }
//     //   await sendCapsuleUnlockEmail(user, capsule);
//     // } catch (err) { console.error('Auto-unlock error:', err.message); }
//   }
// }

// async function autoUnlockCapsules(userId) {
//   // Find capsules that should be unlocked
//   const capsulesToUnlock = await prisma.capsule.findMany({
//     where: {
//       creatorId: userId,
//       status: 'LOCKED',
//       unlockAt: { lte: new Date() },
//       isGeoLocked: false,
//       prerequisiteId: null,
//     },
//     select: { id: true, title: true },
//   });

//   if (capsulesToUnlock.length === 0) return;

//   // Unlock them
//   await prisma.capsule.updateMany({
//     where: { id: { in: capsulesToUnlock.map((c) => c.id) } },
//     data: { status: 'UNLOCKED' },
//   });

//   // Create notifications for each
//   const { createNotification } = require('../services/notificationService');
//   for (const capsule of capsulesToUnlock) {
//     try {
//       await createNotification({
//         userId,
//         type: 'capsule_unlocked',
//         title: '🔓 Capsule Unlocked!',
//         message: `Your capsule "${capsule.title}" is now open and ready to read.`,
//         capsuleId: capsule.id,
//       });
//     } catch {}
//   }
// }
// async function autoUnlockCapsules(userId) {
//   await prisma.capsule.updateMany({
//     where: {
//       creatorId: userId,
//       status: 'LOCKED',
//       unlockAt: { lte: new Date() },
//       isGeoLocked: false,
//     },
//     data: { status: 'UNLOCKED' },
//   });
// }
// async function autoUnlockCapsules(userId) {
//   await prisma.capsule.updateMany({
//     where: { creatorId: userId, status: 'LOCKED', unlockAt: { lte: new Date() } },
//     data: { status: 'UNLOCKED' },
//   });
// }

function getTimeRemaining(unlockAt) {
  const diff = new Date(unlockAt).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    total: diff,
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

module.exports = {
  createCapsule,
  getUserCapsules,
  getCapsuleById,
  updateCapsule,
  deleteCapsule,
  deleteAttachment,
};

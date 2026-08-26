const fs = require('fs');
const path = require('path');
const { prisma } = require('../config/db');
const AppError = require('../utils/AppError');
const { getQueue } = require('../config/queue');
const { scheduleCapsuleUnlock, cancelCapsuleUnlock } = require('../jobs/capsuleJobs');

/**
 * Capsule Service — with Scheduled Delivery
 * 
 * When a capsule is created → a delayed job is scheduled
 * When a capsule is updated (new unlock date) → old job cancelled, new one scheduled
 * When a capsule is deleted → the scheduled job is cancelled
 */

// ============================================
// CREATE
// ============================================
async function createCapsule(userId, data, files = []) {
  const capsule = await prisma.capsule.create({
    data: {
      title: data.title,
      content: data.content || null,
      unlockAt: new Date(data.unlockAt),
      isPublic: data.isPublic === 'true' || data.isPublic === true,
      creatorId: userId,
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

  // Schedule the unlock job
  try {
    const boss = getQueue();
    await scheduleCapsuleUnlock(boss, capsule.id, capsule.unlockAt);
  } catch (error) {
    console.error('⚠️ Failed to schedule unlock job:', error.message);
    // Don't fail the capsule creation — the auto-unlock fallback still works
  }

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
    },
  });

  if (!capsule) throw new AppError('Capsule not found', 404);
  if (capsule.creatorId !== userId && !capsule.isPublic) {
    throw new AppError('You do not have permission to view this capsule', 403);
  }

  // Auto-unlock if time passed
  if (capsule.status === 'LOCKED' && new Date() >= capsule.unlockAt) {
    const updated = await prisma.capsule.update({
      where: { id: capsuleId },
      data: { status: 'UNLOCKED' },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        attachments: true,
      },
    });
    return { ...updated, isLocked: false, timeRemaining: null, attachmentCount: updated.attachments.length };
  }

  // Locked — owner sees content, others don't
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

  // Mark as opened on first view
  if (capsule.status === 'UNLOCKED' && capsule.creatorId === userId) {
    const opened = await prisma.capsule.update({
      where: { id: capsuleId },
      data: { status: 'OPENED', openedAt: new Date() },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        attachments: true,
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

  const updated = await prisma.capsule.update({
    where: { id: capsuleId },
    data: updateData,
    include: {
      creator: { select: { id: true, name: true, email: true } },
      attachments: true,
    },
  });

  // If unlock date changed, reschedule the job
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

  // Delete files from disk
  for (const attachment of capsule.attachments) {
    const filePath = path.join(__dirname, '../../uploads', attachment.filename);
    try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch {}
  }

  // Cancel the scheduled unlock job
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
  await prisma.capsule.updateMany({
    where: { creatorId: userId, status: 'LOCKED', unlockAt: { lte: new Date() } },
    data: { status: 'UNLOCKED' },
  });
}

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

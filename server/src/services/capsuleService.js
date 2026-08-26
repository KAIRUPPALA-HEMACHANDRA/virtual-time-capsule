const { prisma } = require('../config/db');
const AppError = require('../utils/AppError');

/**
 * Capsule Service
 * 
 * Handles all capsule business logic:
 * - Create a capsule with a future unlock date
 * - List all capsules for a user (locked ones hide content)
 * - View a single capsule (content visible only if unlocked)
 * - Update a capsule (only if still locked and you're the owner)
 * - Delete a capsule (only if you're the owner)
 * - Auto-check: if unlock date has passed, mark as UNLOCKED
 */

/**
 * CREATE A NEW CAPSULE
 */
async function createCapsule(userId, data) {
  const capsule = await prisma.capsule.create({
    data: {
      title: data.title,
      content: data.content || null,
      unlockAt: new Date(data.unlockAt),
      isPublic: data.isPublic || false,
      creatorId: userId,
    },
    include: {
      creator: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return capsule;
}

/**
 * GET ALL CAPSULES FOR A USER
 * 
 * Returns all capsules created by the user.
 * IMPORTANT: For locked capsules, we hide the content.
 * The user can see the title and countdown, but not what's inside.
 */
async function getUserCapsules(userId) {
  // First, auto-unlock any capsules whose unlock date has passed
  await autoUnlockCapsules(userId);

  const capsules = await prisma.capsule.findMany({
    where: { creatorId: userId },
    orderBy: { createdAt: 'desc' },
    include: {
      creator: {
        select: { id: true, name: true },
      },
    },
  });

  // Hide content for locked capsules
  return capsules.map((capsule) => {
    if (capsule.status === 'LOCKED') {
      return {
        ...capsule,
        content: null, // Hide the actual content
        isLocked: true,
        timeRemaining: getTimeRemaining(capsule.unlockAt),
      };
    }
    return {
      ...capsule,
      isLocked: false,
      timeRemaining: null,
    };
  });
}

/**
 * GET A SINGLE CAPSULE BY ID
 * 
 * If the capsule is locked, content is hidden.
 * If the unlock date has passed, auto-unlock it first.
 * If the capsule is unlocked and this is the first time viewing,
 * mark it as OPENED.
 */
async function getCapsuleById(capsuleId, userId) {
  const capsule = await prisma.capsule.findUnique({
    where: { id: capsuleId },
    include: {
      creator: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!capsule) {
    throw new AppError('Capsule not found', 404);
  }

  // Check if the user has permission to view this capsule
  // For now, only the creator can view (we'll add recipients later)
  if (capsule.creatorId !== userId && !capsule.isPublic) {
    throw new AppError('You do not have permission to view this capsule', 403);
  }

  // Auto-unlock if the unlock date has passed
  if (capsule.status === 'LOCKED' && new Date() >= capsule.unlockAt) {
    const updated = await prisma.capsule.update({
      where: { id: capsuleId },
      data: { status: 'UNLOCKED' },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return {
      ...updated,
      isLocked: false,
      timeRemaining: null,
    };
  }

    // If still locked, hide content from non-owners
  if (capsule.status === 'LOCKED') {
    return {
      ...capsule,
      content: capsule.creatorId === userId ? capsule.content : null,
      isLocked: true,
      timeRemaining: getTimeRemaining(capsule.unlockAt),
    };
  }

  // If unlocked but not yet opened, mark as opened
  if (capsule.status === 'UNLOCKED' && capsule.creatorId === userId) {
    const opened = await prisma.capsule.update({
      where: { id: capsuleId },
      data: {
        status: 'OPENED',
        openedAt: new Date(),
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return {
      ...opened,
      isLocked: false,
      timeRemaining: null,
    };
  }

  return {
    ...capsule,
    isLocked: false,
    timeRemaining: null,
  };
}

/**
 * UPDATE A CAPSULE
 * 
 * Rules:
 * - Only the creator can update
 * - Can only update if the capsule is still LOCKED
 * - Once unlocked/opened, it's sealed — no modifications
 */
async function updateCapsule(capsuleId, userId, data) {
  const capsule = await prisma.capsule.findUnique({
    where: { id: capsuleId },
  });

  if (!capsule) {
    throw new AppError('Capsule not found', 404);
  }

  if (capsule.creatorId !== userId) {
    throw new AppError('You can only edit your own capsules', 403);
  }

  if (capsule.status !== 'LOCKED') {
    throw new AppError('Cannot edit a capsule that has already been unlocked or opened', 400);
  }

  const updateData = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.content !== undefined) updateData.content = data.content;
  if (data.unlockAt !== undefined) updateData.unlockAt = new Date(data.unlockAt);
  if (data.isPublic !== undefined) updateData.isPublic = data.isPublic;

  const updated = await prisma.capsule.update({
    where: { id: capsuleId },
    data: updateData,
    include: {
      creator: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return updated;
}

/**
 * DELETE A CAPSULE
 * 
 * Only the creator can delete their capsule.
 */
async function deleteCapsule(capsuleId, userId) {
  const capsule = await prisma.capsule.findUnique({
    where: { id: capsuleId },
  });

  if (!capsule) {
    throw new AppError('Capsule not found', 404);
  }

  if (capsule.creatorId !== userId) {
    throw new AppError('You can only delete your own capsules', 403);
  }

  await prisma.capsule.delete({
    where: { id: capsuleId },
  });

  return { message: 'Capsule deleted successfully' };
}

/**
 * AUTO-UNLOCK CAPSULES
 * 
 * Checks all locked capsules for a user and unlocks any
 * whose unlock date has passed. This runs automatically
 * when the user fetches their capsule list.
 * 
 * Later, BullMQ will handle this proactively with scheduled jobs,
 * but this is a safety net to ensure capsules are always
 * in the correct state when viewed.
 */
async function autoUnlockCapsules(userId) {
  await prisma.capsule.updateMany({
    where: {
      creatorId: userId,
      status: 'LOCKED',
      unlockAt: {
        lte: new Date(), // unlock date is less than or equal to now
      },
    },
    data: {
      status: 'UNLOCKED',
    },
  });
}

/**
 * CALCULATE TIME REMAINING
 * 
 * Returns a human-readable breakdown of how much time is left
 * until a capsule unlocks.
 */
function getTimeRemaining(unlockAt) {
  const now = new Date();
  const unlock = new Date(unlockAt);
  const diff = unlock.getTime() - now.getTime();

  if (diff <= 0) return null; // Already past

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return {
    total: diff,
    days,
    hours,
    minutes,
    seconds,
    readable: `${days}d ${hours}h ${minutes}m ${seconds}s`,
  };
}

module.exports = {
  createCapsule,
  getUserCapsules,
  getCapsuleById,
  updateCapsule,
  deleteCapsule,
};

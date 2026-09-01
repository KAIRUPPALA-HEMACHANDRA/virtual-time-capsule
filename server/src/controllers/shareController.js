const { prisma } = require('../config/db');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

/**
 * GET /api/shared/:token
 * 
 * PUBLIC — no authentication required.
 * Anyone with the share link can view the capsule after it unlocks.
 * This is how friends without accounts can read capsule messages.
 */
const viewSharedCapsule = catchAsync(async (req, res) => {
  const capsule = await prisma.capsule.findUnique({
    where: { shareToken: req.params.token },
    include: {
      creator: { select: { name: true } },
      attachments: true,
      contributors: {
        select: {
          content: true,
          status: true,
          user: { select: { name: true } },
          email: true,
        },
      },
    },
  });

  if (!capsule) {
    throw new AppError('This capsule link is invalid or has expired', 404);
  }

  // Check if capsule is still locked
  if (capsule.status === 'LOCKED' && new Date() < capsule.unlockAt) {
    return res.status(200).json({
      status: 'success',
      data: {
        capsule: {
          title: capsule.title,
          status: 'LOCKED',
          unlockAt: capsule.unlockAt,
          createdAt: capsule.createdAt,
          creatorName: capsule.isAnonymous ? 'Anonymous' : capsule.creator.name,
          isAnonymous: capsule.isAnonymous || false,
          isLocked: true,
        },
      },
    });
  }

  // Auto-unlock if time has passed and not geo-locked
  if (capsule.status === 'LOCKED' && new Date() >= capsule.unlockAt && !capsule.isGeoLocked) {
    await prisma.capsule.update({
      where: { id: capsule.id },
      data: { status: 'UNLOCKED' },
    });
  }

  // Check self-destruct
  if (capsule.selfDestructAfterRead && capsule.status === 'OPENED') {
    throw new AppError('This capsule has self-destructed after being read 💨', 410);
  }

  // Return the full capsule content
  const response = {
    id: capsule.id,
    title: capsule.title,
    content: capsule.isEncrypted ? capsule.content : capsule.content,
    status: capsule.status,
    isEncrypted: capsule.isEncrypted,
    unlockAt: capsule.unlockAt,
    createdAt: capsule.createdAt,
    creatorName: capsule.isAnonymous ? 'Anonymous 🎭' : capsule.creator.name,
    isAnonymous: capsule.isAnonymous || false,
    selfDestructAfterRead: capsule.selfDestructAfterRead || false,
    sentimentLabel: capsule.sentimentLabel,
    isLocked: false,
    attachments: capsule.attachments.map((a) => ({
      id: a.id,
      originalName: a.originalName,
      mimetype: a.mimetype,
      path: a.path,
    })),
    contributions: capsule.contributors
      .filter((c) => c.status === 'contributed' && c.content)
      .map((c) => ({
        name: c.user?.name || 'Anonymous',
        content: c.content,
      })),
  };

  // If self-destruct is enabled, mark as opened (next view will fail)
  if (capsule.selfDestructAfterRead && capsule.status !== 'OPENED') {
    await prisma.capsule.update({
      where: { id: capsule.id },
      data: { status: 'OPENED', openedAt: new Date() },
    });
  }

  res.status(200).json({
    status: 'success',
    data: { capsule: response },
  });
});

/**
 * POST /api/shared/:token/react
 * Add an emoji reaction to a shared capsule
 */
const reactToCapsule = catchAsync(async (req, res) => {
  const { emoji } = req.body;
  
  const capsule = await prisma.capsule.findUnique({
    where: { shareToken: req.params.token },
  });

  if (!capsule) throw new AppError('Capsule not found', 404);

  // Store reaction (we'll use a simple JSON field approach)
  const currentReactions = capsule.reactions ? JSON.parse(capsule.reactions) : [];
  currentReactions.push({
    emoji,
    timestamp: new Date().toISOString(),
  });

  await prisma.capsule.update({
    where: { id: capsule.id },
    data: { reactions: JSON.stringify(currentReactions) },
  });

  // Notify the creator
  const { createNotification } = require('../services/notificationService');
  await createNotification({
    userId: capsule.creatorId,
    type: 'capsule_reaction',
    title: `${emoji} Reaction!`,
    message: `Someone reacted ${emoji} to your capsule "${capsule.title}"`,
    capsuleId: capsule.id,
  });

  res.json({ status: 'success', message: 'Reaction sent!' });
});

module.exports = { viewSharedCapsule, reactToCapsule };

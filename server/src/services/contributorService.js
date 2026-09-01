const { prisma } = require('../config/db');
const AppError = require('../utils/AppError');
const { createNotification } = require('./notificationService');

/**
 * Contributor Service
 * 
 * Handles collaborative capsule operations:
 * - Creator invites contributors by email
 * - Contributors accept the invitation
 * - Contributors add their own content
 * - All contributions are hidden until the capsule unlocks
 */

async function inviteContributors(capsuleId, userId, emails) {
  const capsule = await prisma.capsule.findUnique({ where: { id: capsuleId } });

  if (!capsule) throw new AppError('Capsule not found', 404);
  if (capsule.creatorId !== userId) throw new AppError('Only the creator can invite contributors', 403);
  if (capsule.status !== 'LOCKED') throw new AppError('Cannot invite to an unlocked capsule', 400);

  const contributors = [];

  for (const email of emails) {
    // Check if already invited
    const existing = await prisma.contributor.findUnique({
      where: { capsuleId_email: { capsuleId, email } },
    });

    if (existing) continue;

    const contributor = await prisma.contributor.create({
      data: {
        capsuleId,
        email,
        status: 'pending',
      },
    });

    // If this email belongs to a registered user, link them and notify
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await prisma.contributor.update({
        where: { id: contributor.id },
        data: { userId: user.id },
      });

      await createNotification({
        userId: user.id,
        type: 'capsule_invite',
        title: '📬 Capsule Invitation!',
        message: `You've been invited to contribute to "${capsule.title}".`,
        capsuleId,
      });
    }

    contributors.push(contributor);
  }

  return contributors;
}

async function acceptInvitation(capsuleId, userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found', 404);

  const contributor = await prisma.contributor.findUnique({
    where: { capsuleId_email: { capsuleId, email: user.email } },
  });

  if (!contributor) throw new AppError('You have not been invited to this capsule', 403);
  if (contributor.status === 'accepted') throw new AppError('You have already accepted', 400);

  await prisma.contributor.update({
    where: { id: contributor.id },
    data: {
      status: 'accepted',
      userId,
      joinedAt: new Date(),
    },
  });

  // Notify the creator
  const capsule = await prisma.capsule.findUnique({
    where: { id: capsuleId },
    select: { title: true, creatorId: true },
  });

  if (capsule) {
    await createNotification({
      userId: capsule.creatorId,
      type: 'contributor_joined',
      title: '👥 Contributor Joined!',
      message: `${user.name} has joined your capsule "${capsule.title}".`,
      capsuleId,
    });
  }

  return { message: 'Invitation accepted' };
}

async function addContribution(capsuleId, userId, content) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found', 404);

  const contributor = await prisma.contributor.findUnique({
    where: { capsuleId_email: { capsuleId, email: user.email } },
  });

  if (!contributor) throw new AppError('You are not a contributor to this capsule', 403);

  const capsule = await prisma.capsule.findUnique({ where: { id: capsuleId } });
  if (capsule.status !== 'LOCKED') throw new AppError('Cannot add content to an unlocked capsule', 400);

  await prisma.contributor.update({
    where: { id: contributor.id },
    data: {
      content,
      status: 'contributed',
    },
  });

  return { message: 'Contribution added' };
}

async function getContributors(capsuleId, userId) {
  const capsule = await prisma.capsule.findUnique({
    where: { id: capsuleId },
    include: {
      contributors: {
        include: {
          user: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!capsule) throw new AppError('Capsule not found', 404);

  const isCreator = capsule.creatorId === userId;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const isContributor = capsule.contributors.some((c) => c.email === user?.email);

  if (!isCreator && !isContributor && !capsule.isPublic) {
    throw new AppError('No permission', 403);
  }

  // Hide contribution content if capsule is still locked
  const contributors = capsule.contributors.map((c) => ({
    id: c.id,
    email: c.email,
    status: c.status,
    name: c.user?.name || null,
    content: capsule.status === 'LOCKED' ? null : c.content,
    joinedAt: c.joinedAt,
  }));

  return contributors;
}

async function getPendingInvitations(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return [];

  const invitations = await prisma.contributor.findMany({
    where: {
      email: user.email,
      status: 'pending',
    },
    include: {
      capsule: {
        select: {
          id: true,
          title: true,
          unlockAt: true,
          creator: { select: { name: true } },
        },
      },
    },
  });

  return invitations;
}

module.exports = {
  inviteContributors,
  acceptInvitation,
  addContribution,
  getContributors,
  getPendingInvitations,
};

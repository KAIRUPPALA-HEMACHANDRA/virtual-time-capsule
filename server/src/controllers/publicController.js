const { prisma } = require('../config/db');
const catchAsync = require('../utils/catchAsync');

/**
 * GET /api/public/capsules
 * Returns all opened public capsules — no auth required.
 * This powers the "Public Wall" page.
 */
const getPublicCapsules = catchAsync(async (req, res) => {
  const capsules = await prisma.capsule.findMany({
    where: {
      isPublic: true,
      status: { in: ['UNLOCKED', 'OPENED'] },
    },
    select: {
      id: true,
      title: true,
      content: true,
      sentimentLabel: true,
      createdAt: true,
      unlockAt: true,
      openedAt: true,
      creator: {
        select: { name: true },
      },
    },
    orderBy: { unlockAt: 'desc' },
    take: 50,
  });

  res.status(200).json({
    status: 'success',
    results: capsules.length,
    data: { capsules },
  });
});

module.exports = { getPublicCapsules };

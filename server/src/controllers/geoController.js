const { prisma } = require('../config/db');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { checkGeoUnlock } = require('../utils/geoUtils');

/**
 * POST /api/capsules/:id/geo-check
 * 
 * Client sends their current GPS coordinates.
 * Server checks if they're within the capsule's unlock radius.
 * If yes AND the unlock time has passed, the capsule unlocks.
 */
const geoCheck = catchAsync(async (req, res) => {
  const { latitude, longitude } = req.body;

  if (latitude === undefined || longitude === undefined) {
    throw new AppError('Latitude and longitude are required', 400);
  }

  const capsule = await prisma.capsule.findUnique({
    where: { id: req.params.id },
    include: {
      creator: { select: { id: true, name: true, email: true } },
      attachments: true,
    },
  });

  if (!capsule) throw new AppError('Capsule not found', 404);

  if (capsule.creatorId !== req.user.userId && !capsule.isPublic) {
    throw new AppError('You do not have permission to access this capsule', 403);
  }

  if (!capsule.isGeoLocked) {
    throw new AppError('This capsule is not geo-locked', 400);
  }

  // Check distance
  const result = checkGeoUnlock(
    latitude,
    longitude,
    capsule.latitude,
    capsule.longitude,
    capsule.geoRadius
  );

  // If within range AND time has passed, unlock it
  if (result.withinRange && capsule.status === 'LOCKED' && new Date() >= capsule.unlockAt) {
    const updated = await prisma.capsule.update({
      where: { id: capsule.id },
      data: { status: 'UNLOCKED' },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        attachments: true,
      },
    });

    return res.status(200).json({
      status: 'success',
      data: {
        geoCheck: { ...result, unlocked: true },
        capsule: { ...updated, isLocked: false, timeRemaining: null },
      },
    });
  }

  // If within range but time hasn't passed yet
  if (result.withinRange && capsule.status === 'LOCKED') {
    return res.status(200).json({
      status: 'success',
      data: {
        geoCheck: {
          ...result,
          unlocked: false,
          message: '📍 You are at the right location, but the capsule hasn\'t reached its unlock time yet.',
        },
      },
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      geoCheck: { ...result, unlocked: false },
    },
  });
});

module.exports = { geoCheck };

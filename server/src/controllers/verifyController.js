const { prisma } = require('../config/db');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { verifyContentHash } = require('../utils/hashUtils');

/**
 * Verification Controller
 * 
 * These endpoints are PUBLIC — no authentication required.
 * Anyone with a capsule ID can view the proof-of-creation certificate.
 * The certificate proves content existed at a specific time WITHOUT
 * revealing what the content actually says.
 */

/**
 * GET /api/verify/:id
 * Returns the proof-of-creation certificate for a capsule
 */
const getCertificate = catchAsync(async (req, res) => {
  const capsule = await prisma.capsule.findUnique({
    where: { id: req.params.id },
    select: {
      id: true,
      title: true,
      contentHash: true,
      createdAt: true,
      unlockAt: true,
      status: true,
      isPublic: true,
      creator: {
        select: { name: true },
      },
    },
  });

  if (!capsule) {
    throw new AppError('Capsule not found', 404);
  }

  if (!capsule.contentHash) {
    throw new AppError('No proof-of-creation available for this capsule', 404);
  }

  res.status(200).json({
    status: 'success',
    data: {
      certificate: {
        capsuleId: capsule.id,
        title: capsule.title,
        hash: capsule.contentHash,
        algorithm: 'SHA-256',
        createdAt: capsule.createdAt,
        unlockAt: capsule.unlockAt,
        capsuleStatus: capsule.status,
        isPublic: capsule.isPublic,
        createdBy: capsule.creator.name,
        verification: 'SHA-256( JSON.stringify({ title, content, timestamp }) )',
      },
    },
  });
});

/**
 * POST /api/verify/:id/check
 * Verify that given content matches the stored hash
 * Only works for opened/unlocked capsules (content must be known)
 */
const verifyCapsule = catchAsync(async (req, res) => {
  const { title, content } = req.body;

  const capsule = await prisma.capsule.findUnique({
    where: { id: req.params.id },
    select: {
      contentHash: true,
      createdAt: true,
    },
  });

  if (!capsule) {
    throw new AppError('Capsule not found', 404);
  }

  if (!capsule.contentHash) {
    throw new AppError('No proof-of-creation available for this capsule', 404);
  }

  const isValid = verifyContentHash(title, content, capsule.createdAt, capsule.contentHash);

  res.status(200).json({
    status: 'success',
    data: {
      verified: isValid,
      message: isValid
        ? '✅ Content matches! This proves the content existed at the recorded timestamp.'
        : '❌ Content does not match the stored hash. The content may have been altered.',
    },
  });
});

module.exports = { getCertificate, verifyCapsule };

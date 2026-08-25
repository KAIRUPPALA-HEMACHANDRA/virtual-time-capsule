const catchAsync = require('../utils/catchAsync');
const capsuleService = require('../services/capsuleService');

/**
 * Capsule Controller
 * 
 * Maps HTTP endpoints to capsule service functions:
 *   POST   /api/capsules      → create a new capsule
 *   GET    /api/capsules      → list all your capsules
 *   GET    /api/capsules/:id  → view a single capsule
 *   PATCH  /api/capsules/:id  → update a capsule (only if locked)
 *   DELETE /api/capsules/:id  → delete a capsule
 */

const createCapsule = catchAsync(async (req, res) => {
  const capsule = await capsuleService.createCapsule(req.user.userId, req.body);

  res.status(201).json({
    status: 'success',
    message: 'Time capsule created! It will unlock on the scheduled date.',
    data: { capsule },
  });
});

const getMyCapsules = catchAsync(async (req, res) => {
  const capsules = await capsuleService.getUserCapsules(req.user.userId);

  res.status(200).json({
    status: 'success',
    results: capsules.length,
    data: { capsules },
  });
});

const getCapsule = catchAsync(async (req, res) => {
  const capsule = await capsuleService.getCapsuleById(
    req.params.id,
    req.user.userId
  );

  res.status(200).json({
    status: 'success',
    data: { capsule },
  });
});

const updateCapsule = catchAsync(async (req, res) => {
  const capsule = await capsuleService.updateCapsule(
    req.params.id,
    req.user.userId,
    req.body
  );

  res.status(200).json({
    status: 'success',
    message: 'Capsule updated successfully',
    data: { capsule },
  });
});

const deleteCapsule = catchAsync(async (req, res) => {
  await capsuleService.deleteCapsule(req.params.id, req.user.userId);

  res.status(200).json({
    status: 'success',
    message: 'Capsule deleted successfully',
  });
});

module.exports = {
  createCapsule,
  getMyCapsules,
  getCapsule,
  updateCapsule,
  deleteCapsule,
};

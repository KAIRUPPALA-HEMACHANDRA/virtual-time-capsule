const catchAsync = require('../utils/catchAsync');
const capsuleService = require('../services/capsuleService');

/**
 * Capsule Controller — with File Upload Support
 * 
 * When files are uploaded, Multer processes them BEFORE the controller runs.
 * The uploaded file info is available in req.files (array of file objects).
 * Text fields from the form are in req.body as usual.
 * 
 * NOTE: When sending files, the frontend uses FormData instead of JSON.
 * Multer parses this automatically.
 */

const createCapsule = catchAsync(async (req, res) => {
  const capsule = await capsuleService.createCapsule(
    req.user.userId,
    req.body,
    req.files || [] // Files uploaded via Multer
  );

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

const deleteAttachment = catchAsync(async (req, res) => {
  await capsuleService.deleteAttachment(req.params.attachmentId, req.user.userId);

  res.status(200).json({
    status: 'success',
    message: 'Attachment deleted successfully',
  });
});

module.exports = {
  createCapsule,
  getMyCapsules,
  getCapsule,
  updateCapsule,
  deleteCapsule,
  deleteAttachment,
};

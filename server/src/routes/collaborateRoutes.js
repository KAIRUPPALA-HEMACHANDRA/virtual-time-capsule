const express = require('express');
const { protect } = require('../middleware/auth');
const catchAsync = require('../utils/catchAsync');
const {
  inviteContributors,
  acceptInvitation,
  addContribution,
  getContributors,
  getPendingInvitations,
} = require('../services/contributorService');

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * /api/collaborate/invite:
 *   post:
 *     tags: [Collaborate]
 *     summary: Invite contributors to a capsule
 *     security:
 *       - bearerAuth: []
 */
router.post('/invite', catchAsync(async (req, res) => {
  const { capsuleId, emails } = req.body;
  const contributors = await inviteContributors(capsuleId, req.user.userId, emails);
  res.status(201).json({ status: 'success', data: { contributors } });
}));

/**
 * @swagger
 * /api/collaborate/{capsuleId}/accept:
 *   post:
 *     tags: [Collaborate]
 *     summary: Accept a collaboration invitation
 *     security:
 *       - bearerAuth: []
 */
router.post('/:capsuleId/accept', catchAsync(async (req, res) => {
  const result = await acceptInvitation(req.params.capsuleId, req.user.userId);
  res.json({ status: 'success', ...result });
}));

/**
 * @swagger
 * /api/collaborate/{capsuleId}/contribute:
 *   post:
 *     tags: [Collaborate]
 *     summary: Add your contribution to a collaborative capsule
 *     security:
 *       - bearerAuth: []
 */
router.post('/:capsuleId/contribute', catchAsync(async (req, res) => {
  const { content } = req.body;
  const result = await addContribution(req.params.capsuleId, req.user.userId, content);
  res.json({ status: 'success', ...result });
}));

/**
 * @swagger
 * /api/collaborate/{capsuleId}/contributors:
 *   get:
 *     tags: [Collaborate]
 *     summary: Get all contributors for a capsule
 *     security:
 *       - bearerAuth: []
 */
router.get('/:capsuleId/contributors', catchAsync(async (req, res) => {
  const contributors = await getContributors(req.params.capsuleId, req.user.userId);
  res.json({ status: 'success', data: { contributors } });
}));

/**
 * @swagger
 * /api/collaborate/invitations:
 *   get:
 *     tags: [Collaborate]
 *     summary: Get pending invitations for the current user
 *     security:
 *       - bearerAuth: []
 */
router.get('/invitations', catchAsync(async (req, res) => {
  const invitations = await getPendingInvitations(req.user.userId);
  res.json({ status: 'success', data: { invitations } });
}));

module.exports = router;

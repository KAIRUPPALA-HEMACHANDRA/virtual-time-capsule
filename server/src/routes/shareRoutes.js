const express = require('express');
const { viewSharedCapsule, reactToCapsule } = require('../controllers/shareController');

const router = express.Router();

/**
 * @swagger
 * /api/shared/{token}:
 *   get:
 *     tags: [Shared]
 *     summary: View a shared capsule (no auth required)
 */
router.get('/:token', viewSharedCapsule);

/**
 * @swagger
 * /api/shared/{token}/react:
 *   post:
 *     tags: [Shared]
 *     summary: Add an emoji reaction to a shared capsule
 */
router.post('/:token/react', reactToCapsule);

module.exports = router;

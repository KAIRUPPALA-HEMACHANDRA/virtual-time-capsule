const express = require('express');
const { getPublicCapsules } = require('../controllers/publicController');

const router = express.Router();

/**
 * @swagger
 * /api/public/capsules:
 *   get:
 *     tags: [Public]
 *     summary: Get all opened public capsules (no auth required)
 *     description: Returns capsules marked as public that have been unlocked or opened. Powers the Public Capsule Wall.
 *     responses:
 *       200:
 *         description: List of public opened capsules
 */
router.get('/capsules', getPublicCapsules);

module.exports = router;

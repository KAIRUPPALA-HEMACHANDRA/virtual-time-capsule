const express = require('express');
const verifyController = require('../controllers/verifyController');

const router = express.Router();

/**
 * @swagger
 * /api/verify/{id}:
 *   get:
 *     tags: [Verify]
 *     summary: Get proof-of-creation certificate for a capsule (public)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Certificate with SHA-256 hash, timestamp, and creator
 *       404:
 *         description: Capsule or certificate not found
 */
router.get('/:id', verifyController.getCertificate);

/**
 * @swagger
 * /api/verify/{id}/check:
 *   post:
 *     tags: [Verify]
 *     summary: Verify content matches the stored hash (public)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Verification result — whether content matches the hash
 */
router.post('/:id/check', verifyController.verifyCapsule);

module.exports = router;

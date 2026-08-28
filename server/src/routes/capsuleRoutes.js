const express = require('express');
const capsuleController = require('../controllers/capsuleController');
const sentimentController = require('../controllers/sentimentController');
const { geoCheck } = require('../controllers/geoController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { updateCapsuleSchema } = require('../utils/capsuleValidators');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * /api/capsules/stats/sentiment:
 *   get:
 *     tags: [Capsules]
 *     summary: Get emotion timeline data for all user's capsules
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sentiment timeline with mood distribution
 */
router.get('/stats/sentiment', sentimentController.getSentimentTimeline);

/**
 * @swagger
 * /api/capsules:
 *   post:
 *     tags: [Capsules]
 *     summary: Create a new time capsule (with optional file attachments)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, unlockAt]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Message to Future Me
 *               content:
 *                 type: string
 *                 example: Hey future self!
 *               unlockAt:
 *                 type: string
 *                 format: date-time
 *               isPublic:
 *                 type: boolean
 *                 default: false
 *               isEncrypted:
 *                 type: boolean
 *                 default: false
 *               isGeoLocked:
 *                 type: boolean
 *                 default: false
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               geoRadius:
 *                 type: integer
 *                 default: 100
 *               prerequisiteId:
 *                 type: string
 *                 format: uuid
 *               isLegacy:
 *                 type: boolean
 *                 default: false
 *               legacyDays:
 *                 type: integer
 *               recipients:
 *                 type: string
 *                 description: JSON array of email strings
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 maxItems: 5
 *     responses:
 *       201:
 *         description: Capsule created and sealed
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 */
router.post('/', upload.array('files', 5), capsuleController.createCapsule);

/**
 * @swagger
 * /api/capsules:
 *   get:
 *     tags: [Capsules]
 *     summary: Get all capsules for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of capsules (locked ones have hidden content)
 */
router.get('/', capsuleController.getMyCapsules);

/**
 * @swagger
 * /api/capsules/{id}:
 *   get:
 *     tags: [Capsules]
 *     summary: Get a single capsule by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Capsule data (content hidden if locked)
 *       404:
 *         description: Capsule not found
 *       403:
 *         description: No permission to view
 */
router.get('/:id', capsuleController.getCapsule);

/**
 * @swagger
 * /api/capsules/{id}:
 *   patch:
 *     tags: [Capsules]
 *     summary: Update a locked capsule
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               unlockAt:
 *                 type: string
 *                 format: date-time
 *               isPublic:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Capsule updated
 *       400:
 *         description: Cannot edit unlocked/opened capsule
 */
router.patch('/:id', validate(updateCapsuleSchema), capsuleController.updateCapsule);

/**
 * @swagger
 * /api/capsules/{id}:
 *   delete:
 *     tags: [Capsules]
 *     summary: Delete a capsule and its attachments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Capsule deleted
 *       403:
 *         description: Can only delete own capsules
 */
router.delete('/:id', capsuleController.deleteCapsule);

/**
 * @swagger
 * /api/capsules/{id}/attachments/{attachmentId}:
 *   delete:
 *     tags: [Capsules]
 *     summary: Delete a single attachment from a capsule
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: attachmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Attachment deleted
 */
router.delete('/:id/attachments/:attachmentId', capsuleController.deleteAttachment);

/**
 * @swagger
 * /api/capsules/{id}/geo-check:
 *   post:
 *     tags: [Geo]
 *     summary: Check if user's location is within unlock radius of a geo-locked capsule
 *     security:
 *       - bearerAuth: []
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
 *             required: [latitude, longitude]
 *             properties:
 *               latitude:
 *                 type: number
 *                 example: 17.3850
 *               longitude:
 *                 type: number
 *                 example: 78.4867
 *     responses:
 *       200:
 *         description: Geo-check result with distance and unlock status
 */
router.post('/:id/geo-check', geoCheck);

module.exports = router;

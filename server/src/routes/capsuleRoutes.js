const express = require('express');
const capsuleController = require('../controllers/capsuleController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createCapsuleSchema, updateCapsuleSchema } = require('../utils/capsuleValidators');

/**
 * Capsule Routes
 * 
 * ALL capsule routes are protected — you must be logged in.
 * The protect middleware runs first on every route.
 * 
 *   POST   /api/capsules      → create a new capsule
 *   GET    /api/capsules      → list all your capsules
 *   GET    /api/capsules/:id  → view a single capsule
 *   PATCH  /api/capsules/:id  → update a capsule
 *   DELETE /api/capsules/:id  → delete a capsule
 */

const router = express.Router();

// All routes below require authentication
router.use(protect);

router.post('/', validate(createCapsuleSchema), capsuleController.createCapsule);
router.get('/', capsuleController.getMyCapsules);
router.get('/:id', capsuleController.getCapsule);
router.patch('/:id', validate(updateCapsuleSchema), capsuleController.updateCapsule);
router.delete('/:id', capsuleController.deleteCapsule);

module.exports = router;

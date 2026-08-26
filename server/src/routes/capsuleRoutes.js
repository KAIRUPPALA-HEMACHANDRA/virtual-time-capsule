const express = require('express');
const capsuleController = require('../controllers/capsuleController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { updateCapsuleSchema } = require('../utils/capsuleValidators');
const upload = require('../middleware/upload');

/**
 * Capsule Routes — with File Upload
 * 
 * POST /api/capsules uses upload.array('files', 5) which tells Multer:
 * "Accept up to 5 files from the form field named 'files'"
 * 
 * When files are included, the data comes as FormData (not JSON),
 * so we skip Zod validation on create (Multer handles the parsing).
 * The service layer validates the required fields instead.
 */

const router = express.Router();

router.use(protect);

// Create capsule with optional file uploads (up to 5 files)
router.post('/', upload.array('files', 5), capsuleController.createCapsule);

router.get('/', capsuleController.getMyCapsules);
router.get('/:id', capsuleController.getCapsule);
router.patch('/:id', validate(updateCapsuleSchema), capsuleController.updateCapsule);
router.delete('/:id', capsuleController.deleteCapsule);

// Delete a single attachment from a capsule
router.delete('/:id/attachments/:attachmentId', capsuleController.deleteAttachment);

module.exports = router;

const express = require('express');
const capsuleController = require('../controllers/capsuleController');
const sentimentController = require('../controllers/sentimentController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { updateCapsuleSchema } = require('../utils/capsuleValidators');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(protect);

// Stats routes MUST be before /:id routes (otherwise "stats" is treated as an ID)
router.get('/stats/sentiment', sentimentController.getSentimentTimeline);

router.post('/', upload.array('files', 5), capsuleController.createCapsule);
router.get('/', capsuleController.getMyCapsules);
router.get('/:id', capsuleController.getCapsule);
router.patch('/:id', validate(updateCapsuleSchema), capsuleController.updateCapsule);
router.delete('/:id', capsuleController.deleteCapsule);
router.delete('/:id/attachments/:attachmentId', capsuleController.deleteAttachment);

module.exports = router;

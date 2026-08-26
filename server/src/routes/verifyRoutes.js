const express = require('express');
const verifyController = require('../controllers/verifyController');

/**
 * Verification Routes — PUBLIC (no auth required)
 * 
 * GET  /api/verify/:id       → view proof-of-creation certificate
 * POST /api/verify/:id/check → verify content against stored hash
 */

const router = express.Router();

router.get('/:id', verifyController.getCertificate);
router.post('/:id/check', verifyController.verifyCapsule);

module.exports = router;

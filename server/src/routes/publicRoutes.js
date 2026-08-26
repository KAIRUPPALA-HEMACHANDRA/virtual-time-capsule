const express = require('express');
const { getPublicCapsules } = require('../controllers/publicController');

const router = express.Router();

router.get('/capsules', getPublicCapsules);

module.exports = router;

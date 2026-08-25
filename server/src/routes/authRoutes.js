const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../utils/validators');
const { authLimiter } = require('../middleware/rateLimiter');

/**
 * Auth Routes
 * 
 * This file maps URL paths to controller functions.
 * Think of it as a routing table:
 * 
 *   POST /api/auth/register → validate input → create account
 *   POST /api/auth/login    → validate input → authenticate user
 *   POST /api/auth/refresh  → get new access token
 *   POST /api/auth/logout   → invalidate refresh token
 *   GET  /api/auth/me       → get logged-in user's profile (PROTECTED)
 * 
 * Notice the middleware chain for register:
 *   authLimiter → validate(registerSchema) → authController.register
 * 
 * The request passes through each middleware in order:
 * 1. authLimiter checks if this IP has made too many requests
 * 2. validate checks if the request body has valid data
 * 3. authController.register handles the actual registration
 * 
 * If any middleware fails, the chain stops and an error is sent back.
 */

const router = express.Router();

// Public routes (no authentication required)
router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

// Protected routes (must be logged in)
router.get('/me', protect, authController.getMe);

module.exports = router;

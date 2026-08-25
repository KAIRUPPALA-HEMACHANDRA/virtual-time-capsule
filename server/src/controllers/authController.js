const catchAsync = require('../utils/catchAsync');
const authService = require('../services/authService');
const { NODE_ENV } = require('../config/env');

/**
 * Auth Controller
 * 
 * Controllers are the "receptionist" of your API.
 * They receive the HTTP request, call the appropriate service function,
 * and send back the HTTP response. They should NOT contain business logic.
 * 
 * Each function here maps to an API endpoint:
 *   POST /api/auth/register  → register
 *   POST /api/auth/login     → login
 *   POST /api/auth/refresh   → refresh
 *   POST /api/auth/logout    → logout
 *   GET  /api/auth/me        → getMe
 */

// Cookie options for the refresh token
// HTTP-only cookies cannot be accessed by JavaScript (XSS protection)
const COOKIE_OPTIONS = {
  httpOnly: true,          // JavaScript can't access this cookie
  secure: NODE_ENV === 'production',  // HTTPS only in production
  sameSite: 'lax',         // Prevents CSRF attacks
  maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days in milliseconds
  path: '/',               // Cookie is sent with all requests
};

/**
 * POST /api/auth/register
 * Creates a new user account
 */
const register = catchAsync(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.registerUser(req.body);

  // Set refresh token as HTTP-only cookie
  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

  // Send access token in response body (frontend stores in localStorage)
  res.status(201).json({
    status: 'success',
    message: 'Account created successfully',
    data: { user },
    accessToken,
  });
});

/**
 * POST /api/auth/login
 * Authenticates a user and returns tokens
 */
const login = catchAsync(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.loginUser(req.body);

  // Set refresh token as HTTP-only cookie
  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

  res.status(200).json({
    status: 'success',
    message: 'Logged in successfully',
    data: { user },
    accessToken,
  });
});

/**
 * POST /api/auth/refresh
 * Uses refresh token (from cookie) to get a new access token
 * The frontend calls this automatically when the access token expires
 */
const refresh = catchAsync(async (req, res) => {
  // Read refresh token from the HTTP-only cookie
  const refreshTokenValue = req.cookies.refreshToken;

  const { accessToken } = await authService.refreshAccessToken(refreshTokenValue);

  res.status(200).json({
    status: 'success',
    accessToken,
  });
});

/**
 * POST /api/auth/logout
 * Invalidates the refresh token and clears the cookie
 */
const logout = catchAsync(async (req, res) => {
  const refreshTokenValue = req.cookies.refreshToken;

  // Delete refresh token from database
  await authService.logoutUser(refreshTokenValue);

  // Clear the cookie from the browser
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
});

/**
 * GET /api/auth/me
 * Returns the currently logged-in user's profile
 * This route is PROTECTED - only accessible with a valid access token
 */
const getMe = catchAsync(async (req, res) => {
  // req.user is set by the protect middleware (see middleware/auth.js)
  const user = await authService.getUserProfile(req.user.userId);

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

module.exports = {
  register,
  login,
  refresh,
  logout,
  getMe,
};

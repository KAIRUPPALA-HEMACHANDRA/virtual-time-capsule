const catchAsync = require('../utils/catchAsync');
const authService = require('../services/authService');
const { NODE_ENV } = require('../config/env');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

const register = catchAsync(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.registerUser(req.body);
  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
  res.status(201).json({ status: 'success', message: 'Account created successfully', data: { user }, accessToken });
});

const login = catchAsync(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.loginUser(req.body);
  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
  res.status(200).json({ status: 'success', message: 'Logged in successfully', data: { user }, accessToken });
});

const refresh = catchAsync(async (req, res) => {
  const refreshTokenValue = req.cookies.refreshToken;
  const { accessToken } = await authService.refreshAccessToken(refreshTokenValue);
  res.status(200).json({ status: 'success', accessToken });
});

const logout = catchAsync(async (req, res) => {
  const refreshTokenValue = req.cookies.refreshToken;
  await authService.logoutUser(refreshTokenValue);
  res.clearCookie('refreshToken', { httpOnly: true, secure: NODE_ENV === 'production', sameSite: 'lax', path: '/' });
  res.status(200).json({ status: 'success', message: 'Logged out successfully' });
});

const getMe = catchAsync(async (req, res) => {
  const user = await authService.getUserProfile(req.user.userId);
  res.status(200).json({ status: 'success', data: { user } });
});

const changePassword = catchAsync(async (req, res) => {
  const result = await authService.changePassword(req.user.userId, req.body);
  // Clear refresh token cookie since all sessions are invalidated
  res.clearCookie('refreshToken', { httpOnly: true, secure: NODE_ENV === 'production', sameSite: 'lax', path: '/' });
  res.status(200).json({ status: 'success', message: result.message });
});

module.exports = { register, login, refresh, logout, getMe, changePassword };

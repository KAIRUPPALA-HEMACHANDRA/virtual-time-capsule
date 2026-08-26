const bcrypt = require('bcryptjs');
const { prisma } = require('../config/db');
const AppError = require('../utils/AppError');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiry,
} = require('../utils/tokenUtils');

// ============================================
// REGISTER
// ============================================
async function registerUser({ name, email, password }) {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new AppError('An account with this email already exists', 409);

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt: getRefreshTokenExpiry() },
  });

  return { user, accessToken, refreshToken };
}

// ============================================
// LOGIN
// ============================================
async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Invalid email or password', 401);
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt: getRefreshTokenExpiry() },
  });

  const { password: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, accessToken, refreshToken };
}

// ============================================
// REFRESH ACCESS TOKEN
// ============================================
async function refreshAccessToken(refreshTokenValue) {
  if (!refreshTokenValue) throw new AppError('No refresh token provided', 401);

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshTokenValue);
  } catch {
    throw new AppError('Invalid or expired refresh token. Please log in again.', 401);
  }

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshTokenValue },
  });

  if (!storedToken) throw new AppError('Refresh token not found. Please log in again.', 401);

  if (new Date() > storedToken.expiresAt) {
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });
    throw new AppError('Refresh token has expired. Please log in again.', 401);
  }

  const accessToken = generateAccessToken(decoded.userId);
  return { accessToken };
}

// ============================================
// LOGOUT
// ============================================
async function logoutUser(refreshTokenValue) {
  if (!refreshTokenValue) return;
  await prisma.refreshToken.deleteMany({ where: { token: refreshTokenValue } });
}

// ============================================
// GET PROFILE
// ============================================
async function getUserProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, createdAt: true },
  });
  if (!user) throw new AppError('User not found', 404);
  return user;
}

// ============================================
// CHANGE PASSWORD
// ============================================
async function changePassword(userId, { currentPassword, newPassword }) {
  // Get user with current password hash
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found', 404);

  // Verify current password
  const isCorrect = await bcrypt.compare(currentPassword, user.password);
  if (!isCorrect) throw new AppError('Current password is incorrect', 401);

  // Don't allow same password
  const isSame = await bcrypt.compare(newPassword, user.password);
  if (isSame) throw new AppError('New password must be different from your current password', 400);

  // Hash and save new password
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  // Invalidate all refresh tokens (force re-login on all devices)
  await prisma.refreshToken.deleteMany({ where: { userId } });

  return { message: 'Password changed successfully. Please log in again.' };
}

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getUserProfile,
  changePassword,
};

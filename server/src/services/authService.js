const bcrypt = require('bcryptjs');
const { prisma } = require('../config/db');
const AppError = require('../utils/AppError');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiry,
} = require('../utils/tokenUtils');

/**
 * Auth Service
 * 
 * This file contains ALL the authentication business logic.
 * Controllers call these functions - they handle the "what to do" part.
 * 
 * WHY SEPARATE FROM CONTROLLERS?
 * Controllers handle HTTP (request/response). Services handle logic.
 * If you ever need to authenticate a user from a different context
 * (like a WebSocket connection or a background job), you can reuse
 * this service without needing an HTTP request object.
 */

/**
 * REGISTER A NEW USER
 * 
 * Flow:
 * 1. Check if email is already taken
 * 2. Hash the password (never store plain text!)
 * 3. Create the user in database
 * 4. Generate access + refresh tokens
 * 5. Store refresh token in database
 * 6. Return user data + tokens
 */
async function registerUser({ name, email, password }) {
  // 1. Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError('An account with this email already exists', 409);
  }

  // 2. Hash the password
  // The number 12 is the "salt rounds" - higher = more secure but slower
  // 12 is the sweet spot for security vs performance
  const hashedPassword = await bcrypt.hash(password, 12);

  // 3. Create the user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      // NOTE: we explicitly DON'T select 'password' - never send it back
    },
  });

  // 4. Generate tokens
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  // 5. Store refresh token in database
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: getRefreshTokenExpiry(),
    },
  });

  // 6. Return everything the controller needs
  return { user, accessToken, refreshToken };
}

/**
 * LOGIN AN EXISTING USER
 * 
 * Flow:
 * 1. Find user by email
 * 2. Compare provided password with stored hash
 * 3. Generate new tokens
 * 4. Store refresh token in database
 * 5. Return user data + tokens
 */
async function loginUser({ email, password }) {
  // 1. Find user - include password field (normally excluded)
  const user = await prisma.user.findUnique({
    where: { email },
  });

  // 2. Check if user exists AND password matches
  // We check both together and give the SAME error message for both cases
  // WHY? If we said "user not found" vs "wrong password", an attacker
  // could figure out which emails are registered (information leak)
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Invalid email or password', 401);
  }

  // 3. Generate tokens
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  // 4. Store refresh token
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: getRefreshTokenExpiry(),
    },
  });

  // 5. Return user data (without password!) + tokens
  const { password: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, accessToken, refreshToken };
}

/**
 * REFRESH ACCESS TOKEN
 * 
 * When the access token expires (every 15 min), the frontend sends
 * the refresh token (from the cookie) to get a new access token.
 * The user stays logged in without entering their password again.
 * 
 * Flow:
 * 1. Verify the refresh token is valid (not expired, not tampered)
 * 2. Check if it exists in our database (it might have been revoked/logged out)
 * 3. Generate a new access token
 * 4. Return it
 */
async function refreshAccessToken(refreshTokenValue) {
  if (!refreshTokenValue) {
    throw new AppError('No refresh token provided', 401);
  }

  // 1. Verify the JWT signature and expiration
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshTokenValue);
  } catch {
    throw new AppError('Invalid or expired refresh token. Please log in again.', 401);
  }

  // 2. Check if this refresh token exists in our database
  // It might have been deleted during logout
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshTokenValue },
  });

  if (!storedToken) {
    throw new AppError('Refresh token not found. Please log in again.', 401);
  }

  // Check if the token has expired in the database
  if (new Date() > storedToken.expiresAt) {
    // Clean up expired token
    await prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });
    throw new AppError('Refresh token has expired. Please log in again.', 401);
  }

  // 3. Generate new access token
  const accessToken = generateAccessToken(decoded.userId);

  return { accessToken };
}

/**
 * LOGOUT USER
 * 
 * Deletes the refresh token from the database so it can never be used again.
 * The frontend also clears the access token from localStorage.
 */
async function logoutUser(refreshTokenValue) {
  if (!refreshTokenValue) return; // Nothing to do if no token

  // Delete the refresh token from database
  // We use deleteMany instead of delete because if the token doesn't exist
  // (already logged out), deleteMany won't throw - delete would
  await prisma.refreshToken.deleteMany({
    where: { token: refreshTokenValue },
  });
}

/**
 * GET USER PROFILE
 * 
 * Returns the current user's data. Called by the frontend to display
 * the user's name, email, etc. on the dashboard.
 */
async function getUserProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
}

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getUserProfile,
};

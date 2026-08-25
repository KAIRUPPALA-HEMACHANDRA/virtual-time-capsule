const jwt = require('jsonwebtoken');
const {
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRY,
  JWT_REFRESH_EXPIRY,
} = require('../config/env');

/**
 * Token Utilities
 * 
 * Our auth system uses TWO types of tokens:
 * 
 * ACCESS TOKEN (short-lived: 15 minutes)
 * - Sent in the Authorization header with every API request
 * - Stored in localStorage on the frontend
 * - Contains the user's ID so we know WHO is making the request
 * - Short-lived so if stolen, the damage window is small
 * 
 * REFRESH TOKEN (long-lived: 7 days)
 * - Stored in an HTTP-only cookie (JavaScript can't access it = more secure)
 * - Also stored in our database so we can revoke it (logout)
 * - Used ONLY to get a new access token when the old one expires
 * - The user never sees or handles this token
 * 
 * WHY TWO TOKENS?
 * If we had one long-lived token, a stolen token = 7 days of access.
 * With two tokens: stolen access token = only 15 minutes of access.
 * The refresh token is harder to steal because it's in an HTTP-only cookie.
 */

// Generate a short-lived access token
function generateAccessToken(userId) {
  return jwt.sign(
    { userId },           // Payload - data stored inside the token
    JWT_ACCESS_SECRET,     // Secret key to sign the token
    { expiresIn: JWT_ACCESS_EXPIRY }  // Token expires in 15 minutes
  );
}

// Generate a long-lived refresh token
function generateRefreshToken(userId) {
  return jwt.sign(
    { userId },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRY }  // Token expires in 7 days
  );
}

// Verify and decode an access token
function verifyAccessToken(token) {
  return jwt.verify(token, JWT_ACCESS_SECRET);
}

// Verify and decode a refresh token
function verifyRefreshToken(token) {
  return jwt.verify(token, JWT_REFRESH_SECRET);
}

// Calculate the expiry date for storing refresh token in database
function getRefreshTokenExpiry() {
  // Parse the expiry string (e.g., "7d" → 7 days)
  const match = JWT_REFRESH_EXPIRY.match(/^(\d+)([smhd])$/);
  if (!match) return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default 7 days

  const value = parseInt(match[1]);
  const unit = match[2];

  const multipliers = {
    s: 1000,                    // seconds
    m: 60 * 1000,               // minutes
    h: 60 * 60 * 1000,          // hours
    d: 24 * 60 * 60 * 1000,     // days
  };

  return new Date(Date.now() + value * multipliers[unit]);
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  getRefreshTokenExpiry,
};

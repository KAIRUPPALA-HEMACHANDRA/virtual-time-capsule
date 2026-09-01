const crypto = require('crypto');

/**
 * Generate a unique, URL-safe share token
 * Example: "xK8f2mNp9qRs3tUv"
 * Short enough to share, random enough to be unguessable
 */
function generateShareToken() {
  return crypto.randomBytes(12).toString('base64url');
}

module.exports = { generateShareToken };

const crypto = require('crypto');

/**
 * Proof-of-Creation Hash Generator
 * 
 * Creates a SHA-256 hash that proves specific content existed at a specific time.
 * 
 * HOW IT WORKS:
 * - We combine the capsule's content + title + creation timestamp
 * - We run it through SHA-256 (a one-way cryptographic function)
 * - The result is a unique 64-character hex string
 * 
 * WHY THIS IS USEFUL:
 * - Someone writes "I predict Company X will hit $1 trillion by 2028"
 * - We hash it with the creation timestamp
 * - Years later, they can prove they made that prediction on that exact date
 * - The hash CANNOT be reversed — nobody can figure out the content from it
 * - But if you have the content, you can regenerate the hash and verify it matches
 * 
 * This is the same principle behind blockchain timestamps and Git commits.
 */

/**
 * Generate a SHA-256 hash of capsule content
 * @param {string} title - Capsule title
 * @param {string} content - Capsule text content
 * @param {Date} createdAt - Creation timestamp
 * @returns {string} 64-character hex hash
 */
function generateContentHash(title, content, createdAt) {
  const payload = JSON.stringify({
    title: title || '',
    content: content || '',
    timestamp: createdAt.toISOString(),
  });

  return crypto
    .createHash('sha256')
    .update(payload)
    .digest('hex');
}

/**
 * Verify that content matches a given hash
 * @returns {boolean} true if the hash matches
 */
function verifyContentHash(title, content, createdAt, expectedHash) {
  const computedHash = generateContentHash(title, content, new Date(createdAt));
  return computedHash === expectedHash;
}

module.exports = {
  generateContentHash,
  verifyContentHash,
};

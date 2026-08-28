const app = require('../src/app');
const { prisma } = require('../src/config/db');

/**
 * Test Helpers
 * 
 * Shared utilities for all test files.
 * - getApp() returns the Express app for Supertest
 * - createTestUser() registers a user and returns their token
 * - cleanup() deletes all test data after tests finish
 */

function getApp() {
  return app;
}

async function createTestUser(request, overrides = {}) {
  const userData = {
    name: overrides.name || 'Test User',
    email: overrides.email || `test-${Date.now()}@example.com`,
    password: overrides.password || 'TestPass123',
  };

  const res = await request(app)
    .post('/api/auth/register')
    .send(userData);

  return {
    user: res.body.data?.user,
    accessToken: res.body.accessToken,
    ...userData,
  };
}

async function cleanup() {
  // Delete in order to respect foreign key constraints
  await prisma.recipient.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.capsule.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
}

async function disconnectDB() {
  await prisma.$disconnect();
}

module.exports = {
  getApp,
  createTestUser,
  cleanup,
  disconnectDB,
};

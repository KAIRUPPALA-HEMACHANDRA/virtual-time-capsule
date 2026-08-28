module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  setupFilesAfterSetup: [],
  // Increase timeout for database operations
  testTimeout: 15000,
  // Run tests sequentially (they share a database)
  maxWorkers: 1,
};

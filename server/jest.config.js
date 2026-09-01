module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  testTimeout: 15000,
  maxWorkers: 1,
  moduleNameMapper: {
    '^../src/config/queue$': '<rootDir>/tests/mocks/queue.js',
    '^../config/queue$': '<rootDir>/tests/mocks/queue.js',
  },
};
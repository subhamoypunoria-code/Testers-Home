module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: ['**/__tests__/**/*.test.js', '**/tests/**/*.test.js'],
  collectCoverageFrom: ['src/**/*.js', '!src/server.js', '!src/utils/seed.js'],
  coverageDirectory: 'coverage',
  verbose: true,
};

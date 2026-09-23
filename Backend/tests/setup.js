require('dotenv').config();
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../src/server'); // needs server to export app without listening

let server;

beforeAll(async () => {
  // Ensure a test database is used; override via env or use a test URI
  const testURI = process.env.MONGO_URI_TEST || process.env.MONGO_URI?.replace(/qa_platform$/, 'qa_platform_test') || 'mongodb://localhost:27017/qa_platform_test';
  await mongoose.connect(testURI);
  server = app.listen(0);
});

afterEach(async () => {
  // Clean all collections between tests
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (server) server.close();
});

module.exports = { request };

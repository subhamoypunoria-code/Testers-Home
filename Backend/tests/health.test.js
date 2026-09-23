const request = require('supertest');
const app = require('../src/server');

describe('Health API', () => {
  it('GET /api/health should return platform status', async () => {
    const res = await request(app).get('/api/health').expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/QA Platform API running/);
  });
});

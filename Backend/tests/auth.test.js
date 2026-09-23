const request = require('supertest');
const app = require('../src/server');

describe('Auth API', () => {
  it('POST /api/auth/register should create a user and downgrade super_admin role', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test@example.com', password: 'Password123', role: 'super_admin' })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe('tester');
    expect(res.body.token).toBeDefined();
  });

  it('POST /api/auth/login should work with valid credentials and reject invalid ones', async () => {
    // Register first
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Login User', email: 'login@example.com', password: 'Password123' });

    // Valid login
    const valid = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'Password123' })
      .expect(200);
    expect(valid.body.success).toBe(true);
    expect(valid.body.token).toBeDefined();

    // Invalid login
    const invalid = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'WrongPassword' })
      .expect(401);
    expect(invalid.body.success).toBe(false);
  });
});

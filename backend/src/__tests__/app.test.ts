import request from 'supertest';
import app from '../app';

describe('🇱🇰 LankaCare API — System & Health Endpoints', () => {
  it('GET /health (Section 13) should return status ok and service name without secrets', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: 'ok',
      service: 'LankaCare API',
    });
    // Ensure no secrets are exposed
    expect(res.body).not.toHaveProperty('jwt');
    expect(res.body).not.toHaveProperty('mongoUri');
    expect(res.body).not.toHaveProperty('password');
  });

  it('GET /api/health (Section 14) should return safe database status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body.service).toContain('LankaCare');
    expect(res.body).toHaveProperty('database');
    expect(['connected', 'unavailable', 'connecting', 'disconnected']).toContain(res.body.database);
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).not.toHaveProperty('jwtSecret');
    expect(res.body).not.toHaveProperty('mongoUri');
  });


  it('GET /api/docs/ should serve the Swagger API documentation', async () => {
    const res = await request(app).get('/api/docs/');
    expect([200, 301, 302]).toContain(res.status);
  });

  it('GET /api/nonexistent-route should return 404 with structured error response', async () => {
    const res = await request(app).get('/api/nonexistent-route');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('message');
  });

  it('POST /api/auth/login without credentials should fail with 400 validation error', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('success', false);
  });

  it('POST /api/auth/register without credentials should fail with 400 validation error', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('success', false);
  });
});

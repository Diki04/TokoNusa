import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import http from 'http';
import { createApp } from '../services/api-gateway/src/app.js';
import { signToken } from '../services/api-gateway/src/middlewares/authProxy.js';

describe('API Gateway Security & Routing', () => {
  const jwtSecret = 'test-secret-key-tokonusa';
  let mockServer;
  let mockServerPort;
  let lastReceivedHeaders = {};
  let lastReceivedUrl = '';

  beforeAll(async () => {
    // Spin up an in-process mock microservice to verify reverse proxying & header propagation
    mockServer = http.createServer((req, res) => {
      lastReceivedHeaders = { ...req.headers };
      lastReceivedUrl = req.url;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ proxied: true, url: req.url }));
    });

    await new Promise((resolve) => {
      mockServer.listen(0, '127.0.0.1', () => {
        mockServerPort = mockServer.address().port;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise((resolve) => {
      if (mockServer) {
        mockServer.close(resolve);
      } else {
        resolve();
      }
    });
  });

  const app = createApp({
    jwtSecret,
    serviceTargets: {
      auth: 'http://localhost:4001',
      catalog: 'http://localhost:4002',
      cart: 'http://localhost:4003',
      order: 'http://localhost:4004',
    },
  });

  it('includes security headers from Helmet', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['x-frame-options']).toBe('DENY');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('enforces sliding-window rate limit on excessive requests', async () => {
    // Send 12 rapid requests to auth endpoint
    let lastRes;
    for (let i = 0; i < 12; i++) {
      lastRes = await request(app).post('/api/auth/login').send({});
    }
    expect(lastRes.status).toBe(429);
    expect(lastRes.body.error.code).toBe('RATE_LIMIT_EXCEEDED');
  });

  it('validates JWT token and propagates user headers to downstream proxy', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('verifies valid Bearer token and forwards user headers to downstream proxy', async () => {
    const customApp = createApp({
      jwtSecret,
      serviceTargets: {
        cart: `http://127.0.0.1:${mockServerPort}`,
      },
    });

    const token = signToken(
      { id: 'usr-buyer-99', email: 'budi@tokonusa.id', role: 'customer' },
      jwtSecret
    );

    const res = await request(customApp)
      .get('/api/cart')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(lastReceivedHeaders['x-user-id']).toBe('usr-buyer-99');
    expect(lastReceivedHeaders['x-user-email']).toBe('budi@tokonusa.id');
    expect(lastReceivedHeaders['x-user-role']).toBe('customer');
    expect(lastReceivedUrl).toBe('/api/cart');
  });

  it('strips client-spoofed user headers when no valid token is provided', async () => {
    const customApp = createApp({
      jwtSecret,
      serviceTargets: {
        catalog: `http://127.0.0.1:${mockServerPort}`,
      },
    });

    const res = await request(customApp)
      .get('/api/catalog/products')
      .set('x-user-id', 'spoofed-id')
      .set('x-user-role', 'admin');

    expect(res.status).toBe(200);
    expect(lastReceivedHeaders['x-user-id']).toBeUndefined();
    expect(lastReceivedHeaders['x-user-role']).toBeUndefined();
    expect(lastReceivedUrl).toBe('/api/catalog/products');
  });

  it('rejects invalid or tampered JWT token with 401 UNAUTHORIZED', async () => {
    const res = await request(app)
      .get('/api/cart')
      .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('rejects malformed Authorization header with 401 UNAUTHORIZED', async () => {
    const res = await request(app)
      .get('/api/cart')
      .set('Authorization', 'Basic dXNlcjpwYXNz');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 502 BAD_GATEWAY when downstream service is unreachable', async () => {
    const brokenApp = createApp({
      jwtSecret,
      serviceTargets: {
        orders: 'http://127.0.0.1:59998', // port where nothing is listening
      },
    });

    const res = await request(brokenApp).get('/api/orders');
    expect(res.status).toBe(502);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('BAD_GATEWAY');
  });

  it('returns 404 NOT_FOUND for unknown routes', async () => {
    const res = await request(app).get('/unknown/route');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('enforces general rate limiting when threshold is exceeded', async () => {
    const limitedApp = createApp({
      jwtSecret,
      generalRateLimit: 5,
      windowMs: 60 * 1000,
    });

    let res;
    for (let i = 0; i < 6; i++) {
      res = await request(limitedApp).get('/health');
    }

    expect(res.status).toBe(429);
    expect(res.body.error.code).toBe('RATE_LIMIT_EXCEEDED');
  });
});

import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../services/auth-service/src/app.js';
import { SqliteUserRepository } from '../services/auth-service/src/infrastructure/repositories/SqliteUserRepository.js';
import { createAuthDatabase } from '../services/auth-service/src/infrastructure/database/sqlite.js';

describe('Auth Service Clean Architecture', () => {
  let app;
  let db;

  beforeAll(() => {
    db = createAuthDatabase(':memory:');
    const userRepo = new SqliteUserRepository(db);
    app = createApp({ userRepo, jwtSecret: 'test-secret-key-tokonusa' });
  });

  it('registers a new buyer successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Budi Santoso',
        email: 'budi.santoso@example.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('budi.santoso@example.com');
    expect(res.body.data.token).toBeDefined();
  });

  it('rejects registration with duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Budi Santoso',
        email: 'budi.santoso@example.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('authenticates user and fetches profile', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'budi.santoso@example.com',
        password: 'Password123!',
      });

    expect(loginRes.status).toBe(200);
    const token = loginRes.body.data.token;

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.data.email).toBe('budi.santoso@example.com');
  });

  it('rejects login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'budi.santoso@example.com',
        password: 'WrongPassword!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('rejects unauthenticated profile request', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('adds user shipping address and returns it in profile', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'budi.santoso@example.com',
        password: 'Password123!',
      });

    const token = loginRes.body.data.token;

    const addAddressRes = await request(app)
      .post('/api/auth/addresses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        receiverName: 'Budi Santoso',
        phone: '081234567890',
        street: 'Jl. Sudirman No. 45',
        city: 'Jakarta Pusat',
        province: 'DKI Jakarta',
        postalCode: '10220',
        isPrimary: true,
      });

    expect(addAddressRes.status).toBe(201);
    expect(addAddressRes.body.success).toBe(true);
    expect(addAddressRes.body.data.street).toBe('Jl. Sudirman No. 45');

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.data.addresses).toHaveLength(1);
    expect(meRes.body.data.addresses[0].city).toBe('Jakarta Pusat');
  });

  it('validates registration input', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'A',
        email: 'invalid-email',
        password: 'short',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('checks service health status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.service).toBe('auth-service');
    expect(res.body.data.status).toBe('healthy');
  });

  it('rejects malformed or invalid authorization tokens', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.token.payload');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('registers a seller role and manages multiple addresses with primary toggle', async () => {
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Siti Rahma',
        email: 'siti.rahma@seller.tokonusa.com',
        password: 'Password123!',
        role: 'SELLER',
        phone: '081987654321',
      });

    expect(regRes.status).toBe(201);
    expect(regRes.body.data.user.role).toBe('SELLER');
    const token = regRes.body.data.token;

    // Add first address as primary
    await request(app)
      .post('/api/auth/addresses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        receiverName: 'Toko Berkah Siti',
        phone: '081987654321',
        street: 'Jl. Malioboro No. 12',
        city: 'Yogyakarta',
        province: 'DI Yogyakarta',
        postalCode: '55271',
        isPrimary: true,
      });

    // Add second address also marked as primary (should unset first as primary)
    await request(app)
      .post('/api/auth/addresses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        receiverName: 'Gudang Siti',
        phone: '081987654322',
        street: 'Jl. Ringroad Utara No. 8',
        city: 'Sleman',
        province: 'DI Yogyakarta',
        postalCode: '55281',
        isPrimary: true,
      });

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.data.addresses).toHaveLength(2);
    const primaryAddresses = meRes.body.data.addresses.filter((a) => a.isPrimary);
    expect(primaryAddresses).toHaveLength(1);
    expect(primaryAddresses[0].receiverName).toBe('Gudang Siti');
  });
});

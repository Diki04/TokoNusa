import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import http from 'http';
import { createApp as createGatewayApp } from '../services/api-gateway/src/app.js';
import { createApp as createAuthApp } from '../services/auth-service/src/app.js';
import { createAuthDatabase } from '../services/auth-service/src/infrastructure/database/sqlite.js';
import { SqliteUserRepository } from '../services/auth-service/src/infrastructure/repositories/SqliteUserRepository.js';
import { createApp as createCatalogApp } from '../services/catalog-service/src/app.js';
import { createCatalogDatabase, seedCatalogData } from '../services/catalog-service/src/infrastructure/database/sqlite.js';
import { SqliteCatalogRepository } from '../services/catalog-service/src/infrastructure/repositories/SqliteCatalogRepository.js';
import { createApp as createCartApp } from '../services/cart-service/src/app.js';
import { createCartDatabase } from '../services/cart-service/src/infrastructure/database/sqlite.js';
import { SqliteCartRepository } from '../services/cart-service/src/infrastructure/repositories/SqliteCartRepository.js';
import { createApp as createOrderApp } from '../services/order-service/src/app.js';
import { createOrderDatabase } from '../services/order-service/src/infrastructure/database/sqlite.js';
import { SqliteOrderRepository } from '../services/order-service/src/infrastructure/repositories/SqliteOrderRepository.js';

describe('TokoNusa End-to-End System Integration & Gateway Lifecycle', () => {
  const jwtSecret = 'test-e2e-secret-key-tokonusa-2026';

  let authServer, catalogServer, cartServer, orderServer;
  let authDb, catalogDb, cartDb, orderDb;
  let gatewayApp;

  beforeAll(async () => {
    // 1. Initialize Auth Service
    authDb = createAuthDatabase(':memory:');
    const authRepo = new SqliteUserRepository(authDb);
    const authApp = createAuthApp({ userRepo: authRepo, jwtSecret });
    authServer = http.createServer(authApp);
    await new Promise((resolve) => authServer.listen(0, '127.0.0.1', resolve));
    const authPort = authServer.address().port;

    // 2. Initialize Catalog Service with seed categories and products
    catalogDb = createCatalogDatabase(':memory:');
    seedCatalogData(catalogDb);
    const catalogRepo = new SqliteCatalogRepository(catalogDb);
    const catalogApp = createCatalogApp({ catalogRepo });
    catalogServer = http.createServer(catalogApp);
    await new Promise((resolve) => catalogServer.listen(0, '127.0.0.1', resolve));
    const catalogPort = catalogServer.address().port;

    // 3. Initialize Cart Service
    cartDb = createCartDatabase(':memory:');
    const cartRepo = new SqliteCartRepository(cartDb);
    const cartApp = createCartApp({ cartRepo });
    cartServer = http.createServer(cartApp);
    await new Promise((resolve) => cartServer.listen(0, '127.0.0.1', resolve));
    const cartPort = cartServer.address().port;

    // 4. Initialize Order Service
    orderDb = createOrderDatabase(':memory:');
    const orderRepo = new SqliteOrderRepository(orderDb);
    const orderApp = createOrderApp({ orderRepo });
    orderServer = http.createServer(orderApp);
    await new Promise((resolve) => orderServer.listen(0, '127.0.0.1', resolve));
    const orderPort = orderServer.address().port;

    // 5. Initialize API Gateway reverse proxying to ephemeral microservice ports
    gatewayApp = createGatewayApp({
      jwtSecret,
      serviceTargets: {
        auth: `http://127.0.0.1:${authPort}`,
        catalog: `http://127.0.0.1:${catalogPort}`,
        cart: `http://127.0.0.1:${cartPort}`,
        orders: `http://127.0.0.1:${orderPort}`,
      },
      authRateLimit: 12,
      generalRateLimit: 100,
    });
  });

  afterAll(async () => {
    const servers = [authServer, catalogServer, cartServer, orderServer];
    for (const server of servers) {
      if (server) {
        if (typeof server.closeAllConnections === 'function') {
          server.closeAllConnections();
        }
        await new Promise((resolve) => server.close(resolve));
      }
    }
    authDb?.close();
    catalogDb?.close();
    cartDb?.close();
    orderDb?.close();
  });

  describe('Full Buyer E2E Lifecycle through API Gateway', () => {
    let buyerToken;
    let buyerId;
    let createdOrderId;
    let targetProduct;

    it('Step 1: Registers and logs in buyer, receiving a valid JWT', async () => {
      // 1a. Register buyer
      const regRes = await request(gatewayApp)
        .post('/api/auth/register')
        .send({
          name: 'Budi Santoso',
          email: 'budi.santoso@example.com',
          password: 'Password123!',
          phone: '081234567890',
          role: 'BUYER',
        });

      expect(regRes.status).toBe(201);
      expect(regRes.body.success).toBe(true);
      expect(regRes.body.data.user.email).toBe('budi.santoso@example.com');
      expect(regRes.body.data.user.name).toBe('Budi Santoso');

      // 1b. Login buyer
      const loginRes = await request(gatewayApp)
        .post('/api/auth/login')
        .send({
          email: 'budi.santoso@example.com',
          password: 'Password123!',
        });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.success).toBe(true);
      expect(loginRes.body.data.token).toBeDefined();
      buyerToken = loginRes.body.data.token;
      buyerId = loginRes.body.data.user.id;
      expect(buyerId).toBeDefined();
    });

    it('Step 2: Queries Catalog categories and searches products by Indonesian keyword', async () => {
      // 2a. List categories
      const catRes = await request(gatewayApp).get('/api/catalog/categories');
      expect(catRes.status).toBe(200);
      expect(catRes.body.success).toBe(true);
      expect(catRes.body.data.length).toBeGreaterThanOrEqual(6);

      // 2b. Search products for "Kopi"
      const searchRes = await request(gatewayApp).get('/api/catalog/products?search=Kopi');
      expect(searchRes.status).toBe(200);
      expect(searchRes.body.success).toBe(true);
      expect(searchRes.body.data.products.length).toBeGreaterThan(0);
      targetProduct = searchRes.body.data.products[0];
      expect(targetProduct.name.toLowerCase()).toContain('kopi');

      // 2c. Fetch detailed product info with variants and images
      const detailRes = await request(gatewayApp).get(`/api/catalog/products/${targetProduct.slug}`);
      expect(detailRes.status).toBe(200);
      expect(detailRes.body.data.id).toBe(targetProduct.id);
      expect(detailRes.body.data.variants.length).toBeGreaterThan(0);
      expect(detailRes.body.data.images.length).toBeGreaterThan(0);
    });

    it('Step 3: Adds item to Cart with merchant grouping and verifies cart summary', async () => {
      const variant = targetProduct.variants?.[0] || { id: 'var-gayo-biji', name: 'Biji Kopi (Whole Beans)' };

      // Add item to cart
      const addRes = await request(gatewayApp)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          productId: targetProduct.id,
          merchantId: targetProduct.merchant_id || 'merchant-kopi-nusantara',
          merchantName: targetProduct.merchant_name || 'Kopi Nusantara Official',
          productName: targetProduct.name,
          productImage: targetProduct.images?.[0]?.image_url || '/images/kopi.png',
          variantId: variant.id,
          variantName: variant.name,
          price: targetProduct.price,
          quantity: 2,
        });

      expect([200, 201]).toContain(addRes.status);
      expect(addRes.body.success).toBe(true);

      // Query cart and verify grouping by merchant
      const cartRes = await request(gatewayApp)
        .get('/api/cart')
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(cartRes.status).toBe(200);
      expect(cartRes.body.success).toBe(true);
      expect(cartRes.body.data.groups.length).toBeGreaterThanOrEqual(1);

      const group = cartRes.body.data.groups.find(
        (g) => g.merchantId === (targetProduct.merchant_id || 'merchant-kopi-nusantara')
      );
      expect(group).toBeDefined();
      expect(group.items.length).toBe(1);
      expect(group.items[0].quantity).toBe(2);
      expect(group.subtotal).toBe(targetProduct.price * 2);
    });

    it('Step 4: Queries available Indonesian couriers and estimated costs', async () => {
      const courierRes = await request(gatewayApp)
        .get('/api/orders/couriers')
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(courierRes.status).toBe(200);
      expect(courierRes.body.success).toBe(true);
      expect(courierRes.body.data.length).toBeGreaterThanOrEqual(4);

      const courierNames = courierRes.body.data.map((c) => c.courier);
      expect(courierNames).toContain('JNE');
      expect(courierNames).toContain('SiCepat');
      expect(courierNames).toContain('GoSend');
      expect(courierNames).toContain('J&T');
    });

    it('Step 5: Creates Order with courier & shipping address', async () => {
      const orderPayload = {
        merchantId: targetProduct.merchant_id || 'merchant-kopi-nusantara',
        merchantName: targetProduct.merchant_name || 'Kopi Nusantara Official',
        items: [
          {
            productId: targetProduct.id,
            productName: targetProduct.name,
            productImage: targetProduct.images?.[0]?.image_url || '/images/kopi.png',
            variantName: 'Biji Kopi (Whole Beans)',
            price: targetProduct.price,
            quantity: 2,
            subtotal: targetProduct.price * 2,
          },
        ],
        shippingCourier: 'JNE',
        shippingService: 'Reguler',
        shippingCost: 15000,
        shippingAddress: 'Jl. Sudirman No. 45, RT 02 / RW 04, Jakarta Selatan, DKI Jakarta 12190',
        paymentMethod: 'QRIS',
      };

      const createOrderRes = await request(gatewayApp)
        .post('/api/orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(orderPayload);

      expect(createOrderRes.status).toBe(201);
      expect(createOrderRes.body.success).toBe(true);
      expect(createOrderRes.body.data.id).toBeDefined();
      expect(createOrderRes.body.data.orderNumber).toBeDefined();
      expect(createOrderRes.body.data.status).toBe('MENUNGGU_PEMBAYARAN');
      expect(createOrderRes.body.data.totalAmount).toBe(targetProduct.price * 2);
      expect(createOrderRes.body.data.shippingCost).toBe(15000);
      expect(createOrderRes.body.data.grandTotal).toBe(targetProduct.price * 2 + 15000);
      expect(createOrderRes.body.data.timeline.length).toBeGreaterThanOrEqual(1);

      createdOrderId = createOrderRes.body.data.id;
    });

    it('Step 6: Simulates QRIS payment confirmation and verifies order state transition', async () => {
      const payRes = await request(gatewayApp)
        .post(`/api/orders/${createdOrderId}/pay`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ paymentMethod: 'QRIS' });

      expect(payRes.status).toBe(200);
      expect(payRes.body.success).toBe(true);
      expect(payRes.body.data.status).toBe('DIPROSES');
      expect(payRes.body.data.paymentStatus).toBe('SUDAH_DIBAYAR');
    });

    it('Step 7: Checks Order History and verifies courier tracking timeline milestones', async () => {
      // 7a. Check order history
      const listRes = await request(gatewayApp)
        .get('/api/orders')
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(listRes.status).toBe(200);
      expect(listRes.body.success).toBe(true);
      const userOrder = listRes.body.data.find((o) => o.id === createdOrderId);
      expect(userOrder).toBeDefined();
      expect(userOrder.status).toBe('DIPROSES');

      // 7b. Advance tracking milestone to DIKIRIM with resi number
      const updateRes = await request(gatewayApp)
        .put(`/api/orders/${createdOrderId}/status`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          status: 'DIKIRIM',
          note: 'Pesanan telah diserahkan ke JNE. No. Resi: JNE8829102910ID',
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.success).toBe(true);
      expect(updateRes.body.data.status).toBe('DIKIRIM');

      // 7c. Retrieve full order detail and verify tracking timeline history
      const detailRes = await request(gatewayApp)
        .get(`/api/orders/${createdOrderId}`)
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(detailRes.status).toBe(200);
      expect(detailRes.body.success).toBe(true);
      const timeline = detailRes.body.data.timeline;
      expect(timeline.length).toBeGreaterThanOrEqual(3);

      const statuses = timeline.map((m) => m.status);
      expect(statuses).toContain('MENUNGGU_PEMBAYARAN');
      expect(statuses).toContain('DIPROSES');
      expect(statuses).toContain('DIKIRIM');

      const deliveryMilestone = timeline.find((m) => m.status === 'DIKIRIM');
      expect(deliveryMilestone.description).toContain('JNE8829102910ID');
    });

    it('Step 8: Verifies Helmet security headers on API Gateway responses', async () => {
      const healthRes = await request(gatewayApp).get('/health');
      expect(healthRes.status).toBe(200);
      expect(healthRes.headers['x-frame-options']).toBe('DENY');
      expect(healthRes.headers['x-content-type-options']).toBe('nosniff');
    });

    it('Step 9: Verifies rate limiter enforcement (HTTP 429) on excessive auth requests', async () => {
      // API Gateway configured with authRateLimit: 12
      // We already made 2 auth calls (register + login)
      let finalRes;
      for (let i = 0; i < 15; i++) {
        finalRes = await request(gatewayApp)
          .post('/api/auth/login')
          .send({ email: 'rate.limit@test.com', password: 'pwd' });
      }

      expect(finalRes.status).toBe(429);
      expect(finalRes.body.success).toBe(false);
      expect(finalRes.body.error.code).toBe('RATE_LIMIT_EXCEEDED');
    });
  });

  describe('Seed & Benchmark Script Interfaces', () => {
    it('verifies seedAll script exists and exports seedAll function', async () => {
      const seedModule = await import('../scripts/seedAll.js');
      expect(typeof seedModule.seedAll).toBe('function');
    });

    it('verifies benchmark script exists and exports runBenchmark function', async () => {
      const benchModule = await import('../scripts/benchmark.js');
      expect(typeof benchModule.runBenchmark).toBe('function');
    });
  });
});

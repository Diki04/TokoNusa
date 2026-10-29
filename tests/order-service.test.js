import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../services/order-service/src/app.js';
import { SqliteOrderRepository } from '../services/order-service/src/infrastructure/repositories/SqliteOrderRepository.js';
import { createOrderDatabase } from '../services/order-service/src/infrastructure/database/sqlite.js';

describe('Order Service Clean Architecture', () => {
  let app;
  let db;
  let orderRepo;

  beforeEach(() => {
    db = createOrderDatabase(':memory:');
    orderRepo = new SqliteOrderRepository(db);
    app = createApp({ orderRepo });
  });

  it('creates order, simulates payment, and updates tracking timeline', async () => {
    const createRes = await request(app)
      .post('/api/orders')
      .set('x-user-id', 'user-1')
      .send({
        merchantId: 'm-1',
        merchantName: 'Toko Nusantara',
        items: [{ productId: 'p-1', productName: 'Batik', price: 150000, quantity: 2, subtotal: 300000 }],
        shippingCourier: 'JNE',
        shippingService: 'Reguler',
        shippingCost: 15000,
        shippingAddress: 'Jl. Sudirman No. 45, Jakarta',
        paymentMethod: 'QRIS',
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    expect(createRes.body.data.id).toBeDefined();
    expect(createRes.body.data.orderNumber).toBeDefined();
    expect(createRes.body.data.status).toBe('MENUNGGU_PEMBAYARAN');
    expect(createRes.body.data.totalAmount).toBe(300000);
    expect(createRes.body.data.grandTotal).toBe(315000);
    expect(createRes.body.data.items.length).toBe(1);
    expect(createRes.body.data.timeline.length).toBe(1);

    const orderId = createRes.body.data.id;

    // Simulate Payment
    const payRes = await request(app)
      .post(`/api/orders/${orderId}/pay`)
      .set('x-user-id', 'user-1')
      .send({ paymentMethod: 'QRIS' });

    expect(payRes.status).toBe(200);
    expect(payRes.body.success).toBe(true);
    expect(payRes.body.data.status).toBe('DIPROSES');
    expect(payRes.body.data.paymentStatus).toBe('SUDAH_DIBAYAR');
    expect(payRes.body.data.timeline.length).toBeGreaterThanOrEqual(2);
    expect(payRes.body.data.timeline[1].status).toBe('DIPROSES');

    // Idempotent payment simulation
    const secondPayRes = await request(app)
      .post(`/api/orders/${orderId}/pay`)
      .set('x-user-id', 'user-1');
    expect(secondPayRes.status).toBe(200);
    expect(secondPayRes.body.data.status).toBe('DIPROSES');
  });

  it('lists courier options with estimated costs and supports filtering', async () => {
    const res = await request(app).get('/api/orders/couriers');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].courier).toBeDefined();
    expect(res.body.data[0].cost).toBeDefined();

    const couriers = res.body.data.map(c => c.courier);
    expect(couriers).toContain('JNE');
    expect(couriers).toContain('SiCepat');
    expect(couriers).toContain('GoSend');
    expect(couriers).toContain('J&T');

    // Filter by courier
    const jneRes = await request(app).get('/api/orders/couriers?courier=JNE');
    expect(jneRes.status).toBe(200);
    expect(jneRes.body.data.every(c => c.courier === 'JNE')).toBe(true);
  });

  it('rejects order creation without x-user-id', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({
        merchantId: 'm-1',
        merchantName: 'Toko Nusantara',
        items: [{ productId: 'p-1', productName: 'Batik', price: 150000, quantity: 1, subtotal: 150000 }],
        shippingCourier: 'JNE',
        shippingService: 'Reguler',
        shippingCost: 15000,
        shippingAddress: 'Jl. Sudirman No. 45',
        paymentMethod: 'QRIS',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('rejects order creation with empty items or invalid fields', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('x-user-id', 'user-1')
      .send({
        merchantId: 'm-1',
        merchantName: 'Toko Nusantara',
        items: [],
        shippingCourier: 'JNE',
        shippingService: 'Reguler',
        shippingCost: 15000,
        shippingAddress: 'Jl. Sudirman No. 45',
        paymentMethod: 'QRIS',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('gets order history and filters by status', async () => {
    // Create order 1
    const res1 = await request(app)
      .post('/api/orders')
      .set('x-user-id', 'user-history')
      .send({
        merchantId: 'm-1',
        merchantName: 'Toko 1',
        items: [{ productId: 'p-1', productName: 'Produk 1', price: 50000, quantity: 1 }],
        shippingCourier: 'SiCepat',
        shippingService: 'Reguler',
        shippingCost: 10000,
        shippingAddress: 'Alamat 1',
        paymentMethod: 'BCA Virtual Account',
      });
    const order1Id = res1.body.data.id;

    // Create order 2
    const res2 = await request(app)
      .post('/api/orders')
      .set('x-user-id', 'user-history')
      .send({
        merchantId: 'm-2',
        merchantName: 'Toko 2',
        items: [{ productId: 'p-2', productName: 'Produk 2', price: 100000, quantity: 1 }],
        shippingCourier: 'JNE',
        shippingService: 'YES',
        shippingCost: 20000,
        shippingAddress: 'Alamat 2',
        paymentMethod: 'GoPay',
      });
    const order2Id = res2.body.data.id;

    // Pay order 2
    await request(app)
      .post(`/api/orders/${order2Id}/pay`)
      .set('x-user-id', 'user-history');

    // Get all orders for user
    const listRes = await request(app)
      .get('/api/orders')
      .set('x-user-id', 'user-history');

    expect(listRes.status).toBe(200);
    expect(listRes.body.data.length).toBe(2);

    // Filter by status = DIPROSES
    const filteredRes = await request(app)
      .get('/api/orders?status=DIPROSES')
      .set('x-user-id', 'user-history');

    expect(filteredRes.status).toBe(200);
    expect(filteredRes.body.data.length).toBe(1);
    expect(filteredRes.body.data[0].id).toBe(order2Id);
  });

  it('gets order detail by id and preserves timeline history across lifecycle', async () => {
    const createRes = await request(app)
      .post('/api/orders')
      .set('x-user-id', 'user-detail')
      .send({
        merchantId: 'm-1',
        merchantName: 'Toko Nusantara',
        items: [{ productId: 'p-1', productName: 'Kemeja Batik', price: 200000, quantity: 1 }],
        shippingCourier: 'JNE',
        shippingService: 'Reguler',
        shippingCost: 15000,
        shippingAddress: 'Bandung',
        paymentMethod: 'QRIS',
      });

    const orderId = createRes.body.data.id;

    // Pay order
    await request(app)
      .post(`/api/orders/${orderId}/pay`)
      .set('x-user-id', 'user-detail');

    // Update status to DIKIRIM
    await request(app)
      .put(`/api/orders/${orderId}/status`)
      .set('x-user-id', 'user-detail')
      .send({
        status: 'DIKIRIM',
        note: 'Nomor resi JNE: JNE1234567890ID',
      });

    // Update status to SELESAI
    await request(app)
      .put(`/api/orders/${orderId}/status`)
      .set('x-user-id', 'user-detail')
      .send({
        status: 'SELESAI',
        note: 'Paket telah diterima di pos satpam.',
      });

    const detailRes = await request(app)
      .get(`/api/orders/${orderId}`)
      .set('x-user-id', 'user-detail');

    expect(detailRes.status).toBe(200);
    expect(detailRes.body.data.id).toBe(orderId);
    expect(detailRes.body.data.status).toBe('SELESAI');
    expect(detailRes.body.data.timeline.length).toBe(4);
    expect(detailRes.body.data.timeline[0].status).toBe('MENUNGGU_PEMBAYARAN');
    expect(detailRes.body.data.timeline[1].status).toBe('DIPROSES');
    expect(detailRes.body.data.timeline[2].status).toBe('DIKIRIM');
    expect(detailRes.body.data.timeline[3].status).toBe('SELESAI');
    expect(detailRes.body.data.timeline[2].description).toContain('JNE1234567890ID');

    // Prevent modifying status after completion
    const modifyAfterComplete = await request(app)
      .put(`/api/orders/${orderId}/status`)
      .set('x-user-id', 'user-detail')
      .send({ status: 'DIBATALKAN' });
    expect(modifyAfterComplete.status).toBe(400);
  });

  it('returns 404 for non-existent order or foreign order', async () => {
    const res = await request(app)
      .get('/api/orders/non-existent-id')
      .set('x-user-id', 'user-1');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);

    // Create order under user-A
    const createRes = await request(app)
      .post('/api/orders')
      .set('x-user-id', 'user-A')
      .send({
        merchantId: 'm-1',
        merchantName: 'Toko Nusantara',
        items: [{ productId: 'p-1', productName: 'Item A', price: 50000, quantity: 1 }],
        shippingCourier: 'JNE',
        shippingService: 'Reguler',
        shippingCost: 10000,
        shippingAddress: 'Jakarta',
        paymentMethod: 'QRIS',
      });
    const orderId = createRes.body.data.id;

    // Access from user-B
    const foreignRes = await request(app)
      .get(`/api/orders/${orderId}`)
      .set('x-user-id', 'user-B');
    expect(foreignRes.status).toBe(404);
  });

  it('rejects order detail access when x-user-id header is missing (401)', async () => {
    const res = await request(app).get('/api/orders/order-xyz-123');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('enforces strict state transitions and rejects illegal jumps', async () => {
    const createRes = await request(app)
      .post('/api/orders')
      .set('x-user-id', 'user-jump')
      .send({
        merchantId: 'm-1',
        merchantName: 'Toko Nusantara',
        items: [{ productId: 'p-1', productName: 'Item', price: 50000, quantity: 1 }],
        shippingCourier: 'JNE',
        shippingService: 'Reguler',
        shippingCost: 10000,
        shippingAddress: 'Jakarta',
        paymentMethod: 'QRIS',
      });
    const orderId = createRes.body.data.id;

    // Illegal jump from MENUNGGU_PEMBAYARAN directly to DIKIRIM
    const illegalJumpRes = await request(app)
      .put(`/api/orders/${orderId}/status`)
      .set('x-user-id', 'user-jump')
      .send({ status: 'DIKIRIM' });

    expect(illegalJumpRes.status).toBe(400);
    expect(illegalJumpRes.body.success).toBe(false);
    expect(illegalJumpRes.body.error.message).toContain('Transisi status tidak valid');

    // Valid transition: MENUNGGU_PEMBAYARAN -> DIBATALKAN
    const cancelRes = await request(app)
      .put(`/api/orders/${orderId}/status`)
      .set('x-user-id', 'user-jump')
      .send({ status: 'DIBATALKAN' });

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.data.status).toBe('DIBATALKAN');

    // Transition from terminal state DIBATALKAN -> DIPROSES should fail
    const terminalRes = await request(app)
      .put(`/api/orders/${orderId}/status`)
      .set('x-user-id', 'user-jump')
      .send({ status: 'DIPROSES' });

    expect(terminalRes.status).toBe(400);
    expect(terminalRes.body.error.message).toContain('Transisi status tidak valid');
  });

  it('rejects invalid order status values', async () => {
    const createRes = await request(app)
      .post('/api/orders')
      .set('x-user-id', 'user-1')
      .send({
        merchantId: 'm-1',
        merchantName: 'Toko Nusantara',
        items: [{ productId: 'p-1', productName: 'Item', price: 50000, quantity: 1 }],
        shippingCourier: 'JNE',
        shippingService: 'Reguler',
        shippingCost: 10000,
        shippingAddress: 'Jakarta',
        paymentMethod: 'QRIS',
      });
    const orderId = createRes.body.data.id;

    const invalidStatusRes = await request(app)
      .put(`/api/orders/${orderId}/status`)
      .set('x-user-id', 'user-1')
      .send({ status: 'STATUS_TIDAK_VALID' });

    expect(invalidStatusRes.status).toBe(400);
  });

  it('returns healthy status on /health endpoint', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.service).toBe('order-service');
  });
});

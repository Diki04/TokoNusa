import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../services/cart-service/src/app.js';
import { SqliteCartRepository } from '../services/cart-service/src/infrastructure/repositories/SqliteCartRepository.js';
import { createCartDatabase } from '../services/cart-service/src/infrastructure/database/sqlite.js';

describe('Cart Service Clean Architecture', () => {
  let app;
  let db;
  let cartRepo;

  beforeEach(() => {
    db = createCartDatabase(':memory:');
    cartRepo = new SqliteCartRepository(db);
    app = createApp({ cartRepo });
  });

  it('adds item to cart and groups by merchant', async () => {
    const addRes = await request(app)
      .post('/api/cart/items')
      .set('x-user-id', 'user-1')
      .send({
        productId: 'prod-1',
        merchantId: 'merchant-ibox',
        merchantName: 'iBox Official Store',
        productName: 'iPhone 16 Pro',
        productImage: '/images/iphone.png',
        price: 20999000,
        quantity: 1,
      });

    expect(addRes.status).toBe(201);
    expect(addRes.body.success).toBe(true);

    const getRes = await request(app)
      .get('/api/cart')
      .set('x-user-id', 'user-1');

    expect(getRes.status).toBe(200);
    expect(getRes.body.data.groups.length).toBe(1);
    expect(getRes.body.data.groups[0].merchantName).toBe('iBox Official Store');
    expect(getRes.body.data.totalAmount).toBe(20999000);
  });

  it('updates item quantity and selection', async () => {
    // Add item first
    await request(app)
      .post('/api/cart/items')
      .set('x-user-id', 'user-1')
      .send({
        productId: 'prod-1',
        merchantId: 'merchant-ibox',
        merchantName: 'iBox Official Store',
        productName: 'iPhone 16 Pro',
        productImage: '/images/iphone.png',
        price: 20999000,
        quantity: 1,
      });

    const getRes = await request(app)
      .get('/api/cart')
      .set('x-user-id', 'user-1');
    const itemId = getRes.body.data.groups[0].items[0].id;

    const qtyRes = await request(app)
      .put(`/api/cart/items/${itemId}/quantity`)
      .set('x-user-id', 'user-1')
      .send({ quantity: 3 });

    expect(qtyRes.status).toBe(200);
    expect(qtyRes.body.data.quantity).toBe(3);

    const selectRes = await request(app)
      .put(`/api/cart/items/${itemId}/select`)
      .set('x-user-id', 'user-1')
      .send({ isSelected: false });

    expect(selectRes.status).toBe(200);
    expect(selectRes.body.data.isSelected).toBe(false);

    // Verify cart total excludes unselected item
    const cartAfterSelect = await request(app)
      .get('/api/cart')
      .set('x-user-id', 'user-1');
    expect(cartAfterSelect.body.data.totalAmount).toBe(0);
  });

  it('removes item from cart', async () => {
    await request(app)
      .post('/api/cart/items')
      .set('x-user-id', 'user-1')
      .send({
        productId: 'prod-1',
        merchantId: 'merchant-ibox',
        merchantName: 'iBox Official Store',
        productName: 'iPhone 16 Pro',
        productImage: '/images/iphone.png',
        price: 20999000,
        quantity: 1,
      });

    const getRes = await request(app)
      .get('/api/cart')
      .set('x-user-id', 'user-1');
    const itemId = getRes.body.data.groups[0].items[0].id;

    const delRes = await request(app)
      .delete(`/api/cart/items/${itemId}`)
      .set('x-user-id', 'user-1');

    expect(delRes.status).toBe(200);

    const emptyRes = await request(app)
      .get('/api/cart')
      .set('x-user-id', 'user-1');
    expect(emptyRes.body.data.groups.length).toBe(0);
    expect(emptyRes.body.data.totalAmount).toBe(0);
  });

  it('merges quantity when adding the same product and variant', async () => {
    await request(app)
      .post('/api/cart/items')
      .set('x-user-id', 'user-1')
      .send({
        productId: 'prod-kopi',
        merchantId: 'merchant-kopi',
        merchantName: 'Kopi Nusantara Official',
        productName: 'Kopi Arabika Gayo Aceh',
        productImage: '/images/kopi.png',
        variantId: 'var-250g',
        variantName: '250gr Medium Dark',
        price: 85000,
        quantity: 2,
      });

    const mergeRes = await request(app)
      .post('/api/cart/items')
      .set('x-user-id', 'user-1')
      .send({
        productId: 'prod-kopi',
        merchantId: 'merchant-kopi',
        merchantName: 'Kopi Nusantara Official',
        productName: 'Kopi Arabika Gayo Aceh',
        productImage: '/images/kopi.png',
        variantId: 'var-250g',
        variantName: '250gr Medium Dark',
        price: 85000,
        quantity: 3,
      });

    expect(mergeRes.status).toBe(200);
    expect(mergeRes.body.data.quantity).toBe(5);

    const getRes = await request(app)
      .get('/api/cart')
      .set('x-user-id', 'user-1');

    expect(getRes.body.data.groups.length).toBe(1);
    expect(getRes.body.data.groups[0].items.length).toBe(1);
    expect(getRes.body.data.groups[0].items[0].quantity).toBe(5);
    expect(getRes.body.data.totalAmount).toBe(85000 * 5);
  });

  it('handles multi-merchant grouping with subtotal per merchant', async () => {
    // Add item from merchant 1
    await request(app)
      .post('/api/cart/items')
      .set('x-user-id', 'user-multi')
      .send({
        productId: 'prod-1',
        merchantId: 'merchant-ibox',
        merchantName: 'iBox Official Store',
        productName: 'iPhone 16 Pro',
        productImage: '/images/iphone.png',
        price: 20000000,
        quantity: 1,
      });

    // Add another item from merchant 1
    await request(app)
      .post('/api/cart/items')
      .set('x-user-id', 'user-multi')
      .send({
        productId: 'prod-2',
        merchantId: 'merchant-ibox',
        merchantName: 'iBox Official Store',
        productName: 'AirPods Pro 2',
        productImage: '/images/airpods.png',
        price: 3500000,
        quantity: 2,
      });

    // Add item from merchant 2
    await request(app)
      .post('/api/cart/items')
      .set('x-user-id', 'user-multi')
      .send({
        productId: 'prod-3',
        merchantId: 'merchant-batik',
        merchantName: 'Batik Keris Official',
        productName: 'Batik Keris Parang Rusak',
        productImage: '/images/batik.png',
        price: 500000,
        quantity: 1,
      });

    const getRes = await request(app)
      .get('/api/cart')
      .set('x-user-id', 'user-multi');

    expect(getRes.status).toBe(200);
    expect(getRes.body.data.groups.length).toBe(2);

    const iboxGroup = getRes.body.data.groups.find((g) => g.merchantId === 'merchant-ibox');
    expect(iboxGroup).toBeDefined();
    expect(iboxGroup.items.length).toBe(2);
    expect(iboxGroup.subtotal).toBe(20000000 * 1 + 3500000 * 2);

    const batikGroup = getRes.body.data.groups.find((g) => g.merchantId === 'merchant-batik');
    expect(batikGroup).toBeDefined();
    expect(batikGroup.items.length).toBe(1);
    expect(batikGroup.subtotal).toBe(500000);

    expect(getRes.body.data.totalAmount).toBe(27500000);
  });

  it('selects and unselects all items with select-all endpoint', async () => {
    await request(app)
      .post('/api/cart/items')
      .set('x-user-id', 'user-select')
      .send({
        productId: 'prod-1',
        merchantId: 'merchant-1',
        merchantName: 'Store 1',
        productName: 'Item 1',
        productImage: '/img1.png',
        price: 10000,
        quantity: 1,
      });

    await request(app)
      .post('/api/cart/items')
      .set('x-user-id', 'user-select')
      .send({
        productId: 'prod-2',
        merchantId: 'merchant-2',
        merchantName: 'Store 2',
        productName: 'Item 2',
        productImage: '/img2.png',
        price: 20000,
        quantity: 1,
      });

    // Unselect all
    const unselectRes = await request(app)
      .put('/api/cart/select-all')
      .set('x-user-id', 'user-select')
      .send({ isSelected: false });

    expect(unselectRes.status).toBe(200);

    const getRes1 = await request(app)
      .get('/api/cart')
      .set('x-user-id', 'user-select');
    expect(getRes1.body.data.totalAmount).toBe(0);
    expect(getRes1.body.data.groups.every((g) => g.items.every((i) => !i.isSelected))).toBe(true);

    // Select all back
    const selectRes = await request(app)
      .put('/api/cart/select-all')
      .set('x-user-id', 'user-select')
      .send({ isSelected: true });

    expect(selectRes.status).toBe(200);

    const getRes2 = await request(app)
      .get('/api/cart')
      .set('x-user-id', 'user-select');
    expect(getRes2.body.data.totalAmount).toBe(30000);
  });

  it('clears selected items after checkout', async () => {
    // Add two items
    const res1 = await request(app)
      .post('/api/cart/items')
      .set('x-user-id', 'user-checkout')
      .send({
        productId: 'prod-selected',
        merchantId: 'm-1',
        merchantName: 'Store 1',
        productName: 'Item Selected',
        productImage: '/img1.png',
        price: 50000,
        quantity: 1,
      });

    const res2 = await request(app)
      .post('/api/cart/items')
      .set('x-user-id', 'user-checkout')
      .send({
        productId: 'prod-unselected',
        merchantId: 'm-2',
        merchantName: 'Store 2',
        productName: 'Item Unselected',
        productImage: '/img2.png',
        price: 75000,
        quantity: 1,
      });

    const itemIdUnselected = res2.body.data.id;

    // Unselect item 2
    await request(app)
      .put(`/api/cart/items/${itemIdUnselected}/select`)
      .set('x-user-id', 'user-checkout')
      .send({ isSelected: false });

    // Clear selected
    const clearRes = await request(app)
      .delete('/api/cart/clear-selected')
      .set('x-user-id', 'user-checkout');

    expect(clearRes.status).toBe(200);

    const cartRes = await request(app)
      .get('/api/cart')
      .set('x-user-id', 'user-checkout');

    // Only unselected item remains
    expect(cartRes.body.data.groups.length).toBe(1);
    expect(cartRes.body.data.groups[0].items[0].productId).toBe('prod-unselected');
  });

  it('returns 404 when updating non-existent item', async () => {
    const res = await request(app)
      .put('/api/cart/items/non-existent-id/quantity')
      .set('x-user-id', 'user-1')
      .send({ quantity: 5 });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('enforces authentication via x-user-id header', async () => {
    const res = await request(app).get('/api/cart');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('rejects invalid payload on add item', async () => {
    const res = await request(app)
      .post('/api/cart/items')
      .set('x-user-id', 'user-1')
      .send({
        productId: '',
        price: -100,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('responds with healthy status on /health', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('healthy');
    expect(res.body.data.service).toBe('cart-service');
  });
});

import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../services/catalog-service/src/app.js';
import { SqliteCatalogRepository } from '../services/catalog-service/src/infrastructure/repositories/SqliteCatalogRepository.js';
import { createCatalogDatabase, seedCatalogData } from '../services/catalog-service/src/infrastructure/database/sqlite.js';

describe('Catalog Service Clean Architecture', () => {
  let app;
  let db;

  beforeAll(() => {
    db = createCatalogDatabase(':memory:');
    seedCatalogData(db);
    const catalogRepo = new SqliteCatalogRepository(db);
    app = createApp({ catalogRepo });
  });

  it('lists seeded products with pagination and filters', async () => {
    const res = await request(app).get('/api/catalog/products?page=1&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.products.length).toBeGreaterThan(0);
    expect(res.body.data.products[0].merchant_name).toBeDefined();
    expect(res.body.data.pagination).toBeDefined();
    expect(res.body.data.pagination.page).toBe(1);
  });

  it('searches product by keyword and filters by category', async () => {
    const res = await request(app).get('/api/catalog/products?search=Kopi');
    expect(res.status).toBe(200);
    expect(res.body.data.products.every((p) => p.name.toLowerCase().includes('kopi'))).toBe(true);
  });

  it('retrieves detailed product by slug including variants and reviews', async () => {
    const listRes = await request(app).get('/api/catalog/products?limit=1');
    const slug = listRes.body.data.products[0].slug;

    const res = await request(app).get(`/api/catalog/products/${slug}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.images).toBeDefined();
    expect(res.body.data.images.length).toBeGreaterThan(0);
    expect(res.body.data.variants).toBeDefined();
    expect(res.body.data.reviews).toBeDefined();
  });

  it('lists all categories with correct count', async () => {
    const res = await request(app).get('/api/catalog/categories');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(6);
    expect(res.body.data[0].slug).toBeDefined();
  });

  it('filters products by category slug and price range', async () => {
    const res = await request(app).get('/api/catalog/products?category=elektronik&minPrice=1000000');
    expect(res.status).toBe(200);
    expect(res.body.data.products.every((p) => p.price >= 1000000)).toBe(true);
  });

  it('sorts products by price ascending and descending', async () => {
    const resAsc = await request(app).get('/api/catalog/products?sort=price_asc');
    expect(resAsc.status).toBe(200);
    const pricesAsc = resAsc.body.data.products.map((p) => p.price);
    for (let i = 1; i < pricesAsc.length; i++) {
      expect(pricesAsc[i]).toBeGreaterThanOrEqual(pricesAsc[i - 1]);
    }

    const resDesc = await request(app).get('/api/catalog/products?sort=price_desc');
    expect(resDesc.status).toBe(200);
    const pricesDesc = resDesc.body.data.products.map((p) => p.price);
    for (let i = 1; i < pricesDesc.length; i++) {
      expect(pricesDesc[i]).toBeLessThanOrEqual(pricesDesc[i - 1]);
    }
  });

  it('allows authenticated seller to create a new product', async () => {
    const categoriesRes = await request(app).get('/api/catalog/categories');
    const categoryId = categoriesRes.body.data[0].id;

    const newProductPayload = {
      name: 'Keyboard Mechanical Wireless RGB TokoNusa Edition',
      description: 'Keyboard mechanical layout 75% dengan switch Gateron Pro Yellow.',
      price: 899000,
      originalPrice: 1099000,
      stock: 50,
      categoryId,
      merchantId: 'seller-tech-01',
      merchantName: 'Nusa Tech Official',
      merchantBadge: 'Official Store',
      city: 'Jakarta Selatan',
      images: [
        { imageUrl: '/images/products/keyboard-1.jpg', isPrimary: true },
        { imageUrl: '/images/products/keyboard-2.jpg', isPrimary: false },
      ],
      variants: [
        { name: 'Red Switch', type: 'SWITCH', priceDelta: 0, stock: 25 },
        { name: 'Brown Switch', type: 'SWITCH', priceDelta: 20000, stock: 25 },
      ],
    };

    const res = await request(app)
      .post('/api/catalog/products')
      .set('x-user-id', 'seller-tech-01')
      .set('x-user-role', 'SELLER')
      .send(newProductPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe(newProductPayload.name);
    expect(res.body.data.slug).toBeDefined();

    // Verify it is retrievable by slug
    const detailRes = await request(app).get(`/api/catalog/products/${res.body.data.slug}`);
    expect(detailRes.status).toBe(200);
    expect(detailRes.body.data.variants.length).toBe(2);
    expect(detailRes.body.data.images.length).toBe(2);
  });

  it('rejects product creation when user is not a SELLER', async () => {
    const res = await request(app)
      .post('/api/catalog/products')
      .set('x-user-id', 'buyer-user-01')
      .set('x-user-role', 'BUYER')
      .send({
        name: 'Unauthorized Product',
        description: 'Should fail',
        price: 100000,
        stock: 10,
        categoryId: 'cat-1',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('adds a customer review to a product and updates rating', async () => {
    const listRes = await request(app).get('/api/catalog/products?limit=1');
    const product = listRes.body.data.products[0];

    const reviewRes = await request(app)
      .post(`/api/catalog/products/${product.id}/reviews`)
      .send({
        userName: 'Ahmad Dahlan',
        rating: 5,
        comment: 'Produk sangat berkualitas, pengiriman cepat dan packing sangat rapi!',
      });

    expect(reviewRes.status).toBe(201);
    expect(reviewRes.body.success).toBe(true);
    expect(reviewRes.body.data.product_id).toBe(product.id);

    // Fetch product detail to verify review is included
    const detailRes = await request(app).get(`/api/catalog/products/${product.id}`);
    expect(detailRes.status).toBe(200);
    expect(detailRes.body.data.reviews.some((r) => r.user_name === 'Ahmad Dahlan')).toBe(true);
  });

  it('returns 404 for non-existent product slug', async () => {
    const res = await request(app).get('/api/catalog/products/non-existent-product-slug-xyz');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('validates product creation input', async () => {
    const res = await request(app)
      .post('/api/catalog/products')
      .set('x-user-id', 'seller-01')
      .set('x-user-role', 'SELLER')
      .send({
        name: '',
        price: -500,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('validates pagination limit does not exceed 50', async () => {
    const invalidLimitRes = await request(app).get('/api/catalog/products?limit=51');
    expect(invalidLimitRes.status).toBe(400);
    expect(invalidLimitRes.body.success).toBe(false);

    const validLimitRes = await request(app).get('/api/catalog/products?limit=50');
    expect(validLimitRes.status).toBe(200);
    expect(validLimitRes.body.success).toBe(true);
  });

  it('checks catalog service health status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.service).toBe('catalog-service');
    expect(res.body.data.status).toBe('healthy');
  });
});

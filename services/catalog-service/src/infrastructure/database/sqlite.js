import { DatabaseSync } from 'node:sqlite';
import { seedCategories, seedProducts } from './seedData.js';

export function createCatalogDatabase(dbPath = 'catalog.db') {
  const db = new DatabaseSync(dbPath);

  if (dbPath !== ':memory:') {
    db.exec('PRAGMA journal_mode = WAL;');
    db.exec('PRAGMA synchronous = NORMAL;');
  }
  db.exec('PRAGMA foreign_keys = ON;');

  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      icon TEXT NOT NULL,
      image_url TEXT
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL,
      price INTEGER NOT NULL,
      original_price INTEGER,
      discount_percent INTEGER DEFAULT 0,
      stock INTEGER NOT NULL DEFAULT 0,
      category_id TEXT NOT NULL,
      merchant_id TEXT NOT NULL,
      merchant_name TEXT NOT NULL,
      merchant_badge TEXT NOT NULL DEFAULT 'Official Store',
      city TEXT NOT NULL,
      rating REAL DEFAULT 5.0,
      sold_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS product_images (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      image_url TEXT NOT NULL,
      is_primary INTEGER DEFAULT 0,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS product_variants (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      price_delta INTEGER DEFAULT 0,
      stock INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS product_reviews (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
    CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating);
    CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
    CREATE INDEX IF NOT EXISTS idx_product_images_prod ON product_images(product_id);
    CREATE INDEX IF NOT EXISTS idx_product_variants_prod ON product_variants(product_id);
    CREATE INDEX IF NOT EXISTS idx_product_reviews_prod ON product_reviews(product_id);
  `);

  return db;
}

export function seedCatalogData(db) {
  // Update or insert category metadata

  db.exec('BEGIN TRANSACTION');
  try {
    const insertCatStmt = db.prepare(`
      INSERT OR REPLACE INTO categories (id, name, slug, icon, image_url)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const cat of seedCategories) {
      insertCatStmt.run(cat.id, cat.name, cat.slug, cat.icon, cat.image_url);
    }

    const insertProdStmt = db.prepare(`
      INSERT INTO products (
        id, name, slug, description, price, original_price, discount_percent,
        stock, category_id, merchant_id, merchant_name, merchant_badge,
        city, rating, sold_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertImgStmt = db.prepare(`
      INSERT INTO product_images (id, product_id, image_url, is_primary)
      VALUES (?, ?, ?, ?)
    `);

    const insertVarStmt = db.prepare(`
      INSERT INTO product_variants (id, product_id, name, type, price_delta, stock)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertRevStmt = db.prepare(`
      INSERT INTO product_reviews (id, product_id, user_name, rating, comment, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const prod of seedProducts) {
      insertProdStmt.run(
        prod.id,
        prod.name,
        prod.slug,
        prod.description,
        prod.price,
        prod.original_price,
        prod.discount_percent,
        prod.stock,
        prod.category_id,
        prod.merchant_id,
        prod.merchant_name,
        prod.merchant_badge,
        prod.city,
        prod.rating,
        prod.sold_count
      );

      if (prod.images && prod.images.length > 0) {
        for (const img of prod.images) {
          insertImgStmt.run(img.id, prod.id, img.image_url, img.is_primary ? 1 : 0);
        }
      }

      if (prod.variants && prod.variants.length > 0) {
        for (const v of prod.variants) {
          insertVarStmt.run(v.id, prod.id, v.name, v.type, v.price_delta || 0, v.stock || 0);
        }
      }

      if (prod.reviews && prod.reviews.length > 0) {
        for (const r of prod.reviews) {
          insertRevStmt.run(r.id, prod.id, r.user_name, r.rating, r.comment, r.created_at || new Date().toISOString());
        }
      }
    }

    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

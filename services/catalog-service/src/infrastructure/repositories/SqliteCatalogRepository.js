import crypto from 'node:crypto';
import { ICatalogRepository } from '../../domain/repositories/ICatalogRepository.js';

export class SqliteCatalogRepository extends ICatalogRepository {
  constructor(db) {
    super();
    this.db = db;
  }

  async findAll(options = {}) {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      rating,
      sort,
      page = 1,
      limit = 20,
    } = options;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const whereClauses = [];
    const params = [];

    if (search && search.trim().length > 0) {
      whereClauses.push('(LOWER(p.name) LIKE ? OR LOWER(p.description) LIKE ?)');
      const term = `%${search.trim().toLowerCase()}%`;
      params.push(term, term);
    }

    if (category && category.trim().length > 0) {
      whereClauses.push('(c.slug = ? OR p.category_id = ?)');
      params.push(category.trim(), category.trim());
    }

    if (minPrice !== undefined && minPrice !== null && minPrice !== '') {
      whereClauses.push('p.price >= ?');
      params.push(Number(minPrice));
    }

    if (maxPrice !== undefined && maxPrice !== null && maxPrice !== '') {
      whereClauses.push('p.price <= ?');
      params.push(Number(maxPrice));
    }

    if (rating !== undefined && rating !== null && rating !== '') {
      whereClauses.push('p.rating >= ?');
      params.push(Number(rating));
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Total count
    const countSql = `
      SELECT COUNT(*) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereSql}
    `;
    const countRow = this.db.prepare(countSql).get(...params);
    const total = countRow ? countRow.total : 0;

    // Sorting
    let orderBySql = 'ORDER BY p.created_at DESC';
    if (sort === 'price_asc') {
      orderBySql = 'ORDER BY p.price ASC';
    } else if (sort === 'price_desc') {
      orderBySql = 'ORDER BY p.price DESC';
    } else if (sort === 'rating_desc' || sort === 'rating') {
      orderBySql = 'ORDER BY p.rating DESC';
    } else if (sort === 'popular' || sort === 'sold') {
      orderBySql = 'ORDER BY p.sold_count DESC';
    } else if (sort === 'latest' || sort === 'newest') {
      orderBySql = 'ORDER BY p.created_at DESC';
    }

    const selectSql = `
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug,
        COALESCE(
          (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC LIMIT 1),
          ''
        ) as primary_image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereSql}
      ${orderBySql}
      LIMIT ? OFFSET ?
    `;

    const rows = this.db.prepare(selectSql).all(...params, limitNum, offset);

    const products = rows.map((row) => {
      const img = row.primary_image || '';
      return {
        ...row,
        imageUrl: img,
        image_url: img,
        primaryImage: img,
        primary_image: img,
        images: img ? [{ id: `img-${row.id}-1`, image_url: img, imageUrl: img, is_primary: 1 }] : [],
        originalPrice: row.original_price,
        discountPercent: row.discount_percent,
        categoryId: row.category_id,
        merchantId: row.merchant_id,
        merchantName: row.merchant_name,
        merchantBadge: row.merchant_badge,
        soldCount: row.sold_count,
        createdAt: row.created_at,
      };
    });

    return {
      products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    };
  }

  async findByIdOrSlug(idOrSlug) {
    const sql = `
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ? OR p.slug = ?
      LIMIT 1
    `;
    const row = this.db.prepare(sql).get(idOrSlug, idOrSlug);
    if (!row) {
      return null;
    }

    const images = this.db
      .prepare('SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC')
      .all(row.id);

    const variants = this.db
      .prepare('SELECT * FROM product_variants WHERE product_id = ?')
      .all(row.id);

    const reviews = this.db
      .prepare('SELECT * FROM product_reviews WHERE product_id = ? ORDER BY created_at DESC')
      .all(row.id);

    const primaryImg = images.find((i) => i.is_primary)?.image_url || images[0]?.image_url || '';

    return {
      ...row,
      imageUrl: primaryImg,
      image_url: primaryImg,
      primaryImage: primaryImg,
      primary_image: primaryImg,
      originalPrice: row.original_price,
      discountPercent: row.discount_percent,
      categoryId: row.category_id,
      merchantId: row.merchant_id,
      merchantName: row.merchant_name,
      merchantBadge: row.merchant_badge,
      soldCount: row.sold_count,
      createdAt: row.created_at,
      images,
      variants,
      reviews,
    };
  }

  async findById(id) {
    const sql = 'SELECT * FROM products WHERE id = ? LIMIT 1';
    return this.db.prepare(sql).get(id) || null;
  }

  async findAllCategories() {
    const sql = 'SELECT * FROM categories ORDER BY name ASC';
    const rows = this.db.prepare(sql).all();
    return rows.map((r) => ({
      ...r,
      imageUrl: r.image_url,
    }));
  }

  async findCategoryById(id) {
    const sql = 'SELECT * FROM categories WHERE id = ? LIMIT 1';
    const row = this.db.prepare(sql).get(id);
    return row ? { ...row, imageUrl: row.image_url } : null;
  }

  async createProduct(productData) {
    this.db.exec('BEGIN TRANSACTION');
    try {
      const insertProdStmt = this.db.prepare(`
        INSERT INTO products (
          id, name, slug, description, price, original_price, discount_percent,
          stock, category_id, merchant_id, merchant_name, merchant_badge,
          city, rating, sold_count, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const createdAt = productData.created_at || productData.createdAt || new Date().toISOString();

      insertProdStmt.run(
        productData.id,
        productData.name,
        productData.slug,
        productData.description || '',
        productData.price,
        productData.original_price !== undefined ? productData.original_price : productData.originalPrice || null,
        productData.discount_percent !== undefined ? productData.discount_percent : productData.discountPercent || 0,
        productData.stock || 0,
        productData.category_id || productData.categoryId,
        productData.merchant_id || productData.merchantId,
        productData.merchant_name || productData.merchantName || 'Official Store',
        productData.merchant_badge || productData.merchantBadge || 'Official Store',
        productData.city || 'Jakarta Pusat',
        productData.rating || 5.0,
        productData.sold_count !== undefined ? productData.sold_count : productData.soldCount || 0,
        createdAt
      );

      if (productData.images && productData.images.length > 0) {
        const insertImgStmt = this.db.prepare(`
          INSERT INTO product_images (id, product_id, image_url, is_primary)
          VALUES (?, ?, ?, ?)
        `);
        for (const img of productData.images) {
          const imgId = img.id || crypto.randomUUID();
          const isPrimary = img.is_primary !== undefined ? (img.is_primary ? 1 : 0) : (img.isPrimary ? 1 : 0);
          const imgUrl = img.image_url || img.imageUrl;
          insertImgStmt.run(imgId, productData.id, imgUrl, isPrimary);
        }
      }

      if (productData.variants && productData.variants.length > 0) {
        const insertVarStmt = this.db.prepare(`
          INSERT INTO product_variants (id, product_id, name, type, price_delta, stock)
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        for (const v of productData.variants) {
          const vId = v.id || crypto.randomUUID();
          const priceDelta = v.price_delta !== undefined ? v.price_delta : v.priceDelta || 0;
          insertVarStmt.run(vId, productData.id, v.name, v.type || 'PILIHAN', priceDelta, v.stock || 0);
        }
      }

      this.db.exec('COMMIT');
    } catch (err) {
      this.db.exec('ROLLBACK');
      throw err;
    }

    return await this.findByIdOrSlug(productData.id);
  }

  async addReview(reviewData) {
    this.db.exec('BEGIN TRANSACTION');
    try {
      const insertRevStmt = this.db.prepare(`
        INSERT INTO product_reviews (id, product_id, user_name, rating, comment, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      const reviewId = reviewData.id || crypto.randomUUID();
      const createdAt = reviewData.created_at || reviewData.createdAt || new Date().toISOString();
      const userName = reviewData.user_name || reviewData.userName;
      const productId = reviewData.product_id || reviewData.productId;

      insertRevStmt.run(
        reviewId,
        productId,
        userName,
        reviewData.rating,
        reviewData.comment,
        createdAt
      );

      // Recalculate average rating
      const avgRow = this.db
        .prepare('SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews FROM product_reviews WHERE product_id = ?')
        .get(productId);

      if (avgRow && avgRow.avg_rating !== null) {
        const roundedRating = Math.round(avgRow.avg_rating * 10) / 10;
        this.db.prepare('UPDATE products SET rating = ? WHERE id = ?').run(roundedRating, productId);
      }

      this.db.exec('COMMIT');

      return {
        id: reviewId,
        product_id: productId,
        productId,
        user_name: userName,
        userName,
        rating: reviewData.rating,
        comment: reviewData.comment,
        created_at: createdAt,
        createdAt,
      };
    } catch (err) {
      this.db.exec('ROLLBACK');
      throw err;
    }
  }
}

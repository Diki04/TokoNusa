import { ValidationError } from '@tokonusa/common';

export class Product {
  constructor({
    id,
    name,
    slug,
    description = '',
    price,
    originalPrice = null,
    original_price = null,
    discountPercent = 0,
    discount_percent = 0,
    stock = 0,
    categoryId,
    category_id,
    merchantId,
    merchant_id,
    merchantName,
    merchant_name,
    merchantBadge = 'Official Store',
    merchant_badge = 'Official Store',
    city = 'Jakarta Pusat',
    rating = 5.0,
    soldCount = 0,
    sold_count = 0,
    images = [],
    variants = [],
    reviews = [],
    createdAt = new Date().toISOString(),
    created_at = new Date().toISOString(),
  }) {
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new ValidationError('Product name cannot be empty');
    }
    const parsedPrice = Number(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      throw new ValidationError('Product price must be a non-negative number');
    }
    const parsedStock = Number(stock);
    if (isNaN(parsedStock) || parsedStock < 0) {
      throw new ValidationError('Product stock cannot be negative');
    }

    this.id = id;
    this.name = name.trim();
    this.slug = slug;
    this.description = description || '';
    this.price = Math.round(parsedPrice);

    const orig = original_price !== null && original_price !== undefined ? original_price : originalPrice;
    this.original_price = orig !== null && orig !== undefined ? Math.round(Number(orig)) : null;
    this.originalPrice = this.original_price;

    const disc = discount_percent || discountPercent || 0;
    this.discount_percent = Math.round(Number(disc));
    this.discountPercent = this.discount_percent;

    this.stock = Math.round(parsedStock);

    this.category_id = category_id || categoryId;
    this.categoryId = this.category_id;

    this.merchant_id = merchant_id || merchantId;
    this.merchantId = this.merchant_id;

    this.merchant_name = merchant_name || merchantName || 'Official Store';
    this.merchantName = this.merchant_name;

    this.merchant_badge = merchant_badge || merchantBadge || 'Official Store';
    this.merchantBadge = this.merchant_badge;

    this.city = city || 'Jakarta Pusat';
    this.rating = Number(rating) || 5.0;

    const sold = sold_count || soldCount || 0;
    this.sold_count = Math.round(Number(sold));
    this.soldCount = this.sold_count;

    this.images = images || [];
    this.variants = variants || [];
    this.reviews = reviews || [];

    this.created_at = created_at || createdAt;
    this.createdAt = this.created_at;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      description: this.description,
      price: this.price,
      original_price: this.original_price,
      originalPrice: this.originalPrice,
      discount_percent: this.discount_percent,
      discountPercent: this.discountPercent,
      stock: this.stock,
      category_id: this.category_id,
      categoryId: this.categoryId,
      merchant_id: this.merchant_id,
      merchantId: this.merchantId,
      merchant_name: this.merchant_name,
      merchantName: this.merchantName,
      merchant_badge: this.merchant_badge,
      merchantBadge: this.merchantBadge,
      city: this.city,
      rating: this.rating,
      sold_count: this.sold_count,
      soldCount: this.soldCount,
      images: this.images,
      variants: this.variants,
      reviews: this.reviews,
      created_at: this.created_at,
      createdAt: this.createdAt,
    };
  }
}

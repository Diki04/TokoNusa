import crypto from 'node:crypto';
import { ForbiddenError, ValidationError } from '@tokonusa/common';
import { Product } from '../../domain/entities/Product.js';

function generateSlug(name) {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const randomSuffix = crypto.randomBytes(3).toString('hex');
  return `${base}-${randomSuffix}`;
}

export class CreateProductUseCase {
  constructor({ catalogRepo }) {
    this.catalogRepo = catalogRepo;
  }

  async execute(productData, userContext = {}) {
    const role = (userContext.role || '').toUpperCase();
    if (role !== 'SELLER' && role !== 'ADMIN') {
      throw new ForbiddenError('Only sellers can create products');
    }

    const id = productData.id || crypto.randomUUID();
    const slug = productData.slug || generateSlug(productData.name);

    const product = new Product({
      ...productData,
      id,
      slug,
      merchantId: userContext.userId || productData.merchantId || 'seller-default',
      merchantName: productData.merchantName || 'Official Seller',
      merchantBadge: productData.merchantBadge || 'Official Store',
      city: productData.city || 'Jakarta Pusat',
    });

    return await this.catalogRepo.createProduct({
      ...product.toJSON(),
      images: productData.images || [],
      variants: productData.variants || [],
    });
  }
}

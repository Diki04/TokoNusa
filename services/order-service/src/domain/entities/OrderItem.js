import crypto from 'node:crypto';
import { ValidationError } from '@tokonusa/common';

export class OrderItem {
  constructor({
    id,
    orderId = null,
    order_id = null,
    productId,
    product_id,
    productName,
    product_name,
    productImage = null,
    product_image = null,
    variantName = null,
    variant_name = null,
    price,
    quantity = 1,
    subtotal,
  }) {
    const finalProductId = productId || product_id;
    const finalProductName = productName || product_name;
    const finalOrderId = orderId || order_id;
    const finalProductImage = productImage !== undefined ? productImage : product_image;
    const finalVariantName = variantName !== undefined ? variantName : variant_name;

    if (!finalProductId || typeof finalProductId !== 'string' || finalProductId.trim().length === 0) {
      throw new ValidationError('Product ID is required for order item');
    }

    if (!finalProductName || typeof finalProductName !== 'string' || finalProductName.trim().length === 0) {
      throw new ValidationError('Product name is required for order item');
    }

    const parsedPrice = Number(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      throw new ValidationError('Item price must be a non-negative number');
    }

    const parsedQuantity = Number(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity < 1 || !Number.isInteger(parsedQuantity)) {
      throw new ValidationError('Item quantity must be a positive integer');
    }

    const parsedSubtotal = subtotal !== undefined && subtotal !== null
      ? Number(subtotal)
      : parsedPrice * parsedQuantity;

    if (isNaN(parsedSubtotal) || parsedSubtotal < 0) {
      throw new ValidationError('Item subtotal must be a non-negative number');
    }

    this.id = id || crypto.randomUUID();
    this.orderId = finalOrderId;
    this.productId = finalProductId.trim();
    this.productName = finalProductName.trim();
    this.productImage = finalProductImage;
    this.variantName = finalVariantName;
    this.price = Math.round(parsedPrice);
    this.quantity = parsedQuantity;
    this.subtotal = Math.round(parsedSubtotal);
  }

  toJSON() {
    return {
      id: this.id,
      orderId: this.orderId,
      productId: this.productId,
      productName: this.productName,
      productImage: this.productImage,
      variantName: this.variantName,
      price: this.price,
      quantity: this.quantity,
      subtotal: this.subtotal,
    };
  }
}

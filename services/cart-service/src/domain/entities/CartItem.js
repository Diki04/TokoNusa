import { ValidationError } from '@tokonusa/common';

export class CartItem {
  constructor({
    id,
    userId,
    user_id,
    productId,
    product_id,
    merchantId,
    merchant_id,
    merchantName,
    merchant_name,
    productName,
    product_name,
    productImage,
    product_image,
    variantId = null,
    variant_id = null,
    variantName = null,
    variant_name = null,
    price,
    quantity = 1,
    isSelected = true,
    is_selected = 1,
    notes = null,
    createdAt = new Date().toISOString(),
    created_at = new Date().toISOString(),
    updatedAt = new Date().toISOString(),
    updated_at = new Date().toISOString(),
  }) {
    const finalUserId = userId || user_id;
    const finalProductId = productId || product_id;
    const finalMerchantId = merchantId || merchant_id;
    const finalMerchantName = merchantName || merchant_name;
    const finalProductName = productName || product_name;
    const finalProductImage = productImage || product_image;
    const finalVariantId = variantId !== undefined ? variantId : variant_id;
    const finalVariantName = variantName !== undefined ? variantName : variant_name;

    if (!finalProductId || typeof finalProductId !== 'string' || finalProductId.trim().length === 0) {
      throw new ValidationError('Product ID cannot be empty');
    }
    if (!finalMerchantId || typeof finalMerchantId !== 'string' || finalMerchantId.trim().length === 0) {
      throw new ValidationError('Merchant ID cannot be empty');
    }
    if (!finalMerchantName || typeof finalMerchantName !== 'string' || finalMerchantName.trim().length === 0) {
      throw new ValidationError('Merchant name cannot be empty');
    }
    if (!finalProductName || typeof finalProductName !== 'string' || finalProductName.trim().length === 0) {
      throw new ValidationError('Product name cannot be empty');
    }

    const parsedPrice = Number(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      throw new ValidationError('Price must be a non-negative number');
    }

    const parsedQty = Number(quantity);
    if (isNaN(parsedQty) || parsedQty < 1 || !Number.isInteger(parsedQty)) {
      throw new ValidationError('Quantity must be an integer greater than or equal to 1');
    }

    const finalSelected = isSelected !== undefined ? Boolean(isSelected) : Boolean(is_selected);

    this.id = id;
    this.userId = finalUserId;
    this.productId = finalProductId.trim();
    this.merchantId = finalMerchantId.trim();
    this.merchantName = finalMerchantName.trim();
    this.productName = finalProductName.trim();
    this.productImage = finalProductImage || '';
    this.variantId = finalVariantId || null;
    this.variantName = finalVariantName || null;
    this.price = Math.round(parsedPrice);
    this.quantity = parsedQty;
    this.isSelected = finalSelected;
    this.notes = notes || null;
    this.createdAt = createdAt || created_at;
    this.updatedAt = updatedAt || updated_at;
  }

  updateQuantity(newQty) {
    const parsed = Number(newQty);
    if (isNaN(parsed) || parsed < 1 || !Number.isInteger(parsed)) {
      throw new ValidationError('Quantity must be an integer greater than or equal to 1');
    }
    this.quantity = parsed;
    this.updatedAt = new Date().toISOString();
  }

  toggleSelect(isSelected) {
    this.isSelected = Boolean(isSelected);
    this.updatedAt = new Date().toISOString();
  }

  updateNotes(notes) {
    this.notes = notes || null;
    this.updatedAt = new Date().toISOString();
  }

  getSubtotal() {
    return this.price * this.quantity;
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      user_id: this.userId,
      productId: this.productId,
      product_id: this.productId,
      merchantId: this.merchantId,
      merchant_id: this.merchantId,
      merchantName: this.merchantName,
      merchant_name: this.merchantName,
      productName: this.productName,
      product_name: this.productName,
      productImage: this.productImage,
      product_image: this.productImage,
      variantId: this.variantId,
      variant_id: this.variantId,
      variantName: this.variantName,
      variant_name: this.variantName,
      price: this.price,
      quantity: this.quantity,
      isSelected: this.isSelected,
      is_selected: this.isSelected ? 1 : 0,
      notes: this.notes,
      subtotal: this.getSubtotal(),
      createdAt: this.createdAt,
      created_at: this.createdAt,
      updatedAt: this.updatedAt,
      updated_at: this.updatedAt,
    };
  }
}

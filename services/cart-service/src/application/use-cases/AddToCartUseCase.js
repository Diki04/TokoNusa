import crypto from 'node:crypto';
import { CartItem } from '../../domain/entities/CartItem.js';

export class AddToCartUseCase {
  constructor({ cartRepo }) {
    this.cartRepo = cartRepo;
  }

  async execute(userId, itemData) {
    const variantId = itemData.variantId || itemData.variant_id || null;
    const existing = await this.cartRepo.findByProductAndVariant(
      userId,
      itemData.productId || itemData.product_id,
      variantId
    );

    if (existing) {
      const incomingQty = itemData.quantity !== undefined ? Number(itemData.quantity) : 1;
      existing.updateQuantity(existing.quantity + incomingQty);
      if (itemData.notes !== undefined) {
        existing.updateNotes(itemData.notes);
      }
      existing.toggleSelect(true);
      await this.cartRepo.save(existing);
      return { item: existing, isMerged: true };
    }

    const newItem = new CartItem({
      id: crypto.randomUUID(),
      userId,
      productId: itemData.productId || itemData.product_id,
      merchantId: itemData.merchantId || itemData.merchant_id,
      merchantName: itemData.merchantName || itemData.merchant_name,
      productName: itemData.productName || itemData.product_name,
      productImage: itemData.productImage || itemData.product_image || '',
      variantId,
      variantName: itemData.variantName || itemData.variant_name || null,
      price: itemData.price,
      quantity: itemData.quantity !== undefined ? Number(itemData.quantity) : 1,
      isSelected: true,
      notes: itemData.notes || null,
    });

    await this.cartRepo.save(newItem);
    return { item: newItem, isMerged: false };
  }
}

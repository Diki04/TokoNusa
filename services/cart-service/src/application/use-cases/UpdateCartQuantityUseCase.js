import { NotFoundError } from '@tokonusa/common';

export class UpdateCartQuantityUseCase {
  constructor({ cartRepo }) {
    this.cartRepo = cartRepo;
  }

  async execute(userId, itemId, quantity) {
    const item = await this.cartRepo.findById(itemId);
    if (!item || item.userId !== userId) {
      throw new NotFoundError('Cart item not found');
    }

    item.updateQuantity(quantity);
    await this.cartRepo.save(item);
    return item;
  }
}

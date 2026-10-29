import { NotFoundError } from '@tokonusa/common';

export class RemoveCartItemUseCase {
  constructor({ cartRepo }) {
    this.cartRepo = cartRepo;
  }

  async execute(userId, itemId) {
    const item = await this.cartRepo.findById(itemId);
    if (!item || item.userId !== userId) {
      throw new NotFoundError('Cart item not found');
    }

    await this.cartRepo.delete(itemId);
    return { success: true, id: itemId };
  }
}

import { NotFoundError } from '@tokonusa/common';

export class ToggleSelectItemUseCase {
  constructor({ cartRepo }) {
    this.cartRepo = cartRepo;
  }

  async execute(userId, itemId, isSelected) {
    const item = await this.cartRepo.findById(itemId);
    if (!item || item.userId !== userId) {
      throw new NotFoundError('Cart item not found');
    }

    item.toggleSelect(isSelected);
    await this.cartRepo.save(item);
    return item;
  }

  async selectAll(userId, isSelected) {
    await this.cartRepo.updateSelectAll(userId, Boolean(isSelected));
    return { success: true, isSelected: Boolean(isSelected) };
  }
}

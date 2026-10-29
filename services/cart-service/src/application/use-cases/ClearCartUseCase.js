export class ClearCartUseCase {
  constructor({ cartRepo }) {
    this.cartRepo = cartRepo;
  }

  async execute(userId, { onlySelected = false } = {}) {
    if (onlySelected) {
      await this.cartRepo.deleteSelected(userId);
    } else {
      await this.cartRepo.clearByUserId(userId);
    }
    return { success: true };
  }
}

import { ValidationError } from '@tokonusa/common';

export class GetOrdersUseCase {
  constructor({ orderRepo }) {
    this.orderRepo = orderRepo;
  }

  async execute(userId, options = {}) {
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      throw new ValidationError('User ID is required to fetch orders');
    }

    return await this.orderRepo.findByUserId(userId, options);
  }
}

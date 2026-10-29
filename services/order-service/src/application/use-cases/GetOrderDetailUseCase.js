import { NotFoundError, UnauthorizedError } from '@tokonusa/common';

export class GetOrderDetailUseCase {
  constructor({ orderRepo }) {
    this.orderRepo = orderRepo;
  }

  async execute(orderId, userId = null) {
    if (!orderId || typeof orderId !== 'string') {
      throw new NotFoundError('Order not found');
    }

    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      throw new UnauthorizedError('Authentication required: user ID is required');
    }

    const order = await this.orderRepo.findById(orderId);
    if (!order) {
      throw new NotFoundError(`Order with ID ${orderId} not found`);
    }

    if (order.userId !== userId.trim()) {
      throw new NotFoundError(`Order with ID ${orderId} not found`);
    }

    return order;
  }
}

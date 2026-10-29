import { NotFoundError, ValidationError } from '@tokonusa/common';

export class UpdateOrderStatusUseCase {
  constructor({ orderRepo }) {
    this.orderRepo = orderRepo;
  }

  async execute(orderId, { status, note = null, userId = null } = {}) {
    if (!status) {
      throw new ValidationError('New order status is required');
    }

    const order = await this.orderRepo.findById(orderId);
    if (!order) {
      throw new NotFoundError(`Order with ID ${orderId} not found`);
    }

    if (userId && order.userId !== userId && order.merchantId !== userId) {
      // In a real app we might differentiate buyer vs merchant vs admin roles.
      // If neither matches, reject.
      throw new NotFoundError(`Order with ID ${orderId} not found`);
    }

    order.updateStatus(status, note);
    await this.orderRepo.update(order);
    return order;
  }
}

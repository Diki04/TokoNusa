import { NotFoundError } from '@tokonusa/common';

export class SimulatePaymentUseCase {
  constructor({ orderRepo }) {
    this.orderRepo = orderRepo;
  }

  async execute(orderId, { paymentMethod = null, userId = null } = {}) {
    const order = await this.orderRepo.findById(orderId);
    if (!order) {
      throw new NotFoundError(`Order with ID ${orderId} not found`);
    }

    if (userId && order.userId !== userId) {
      throw new NotFoundError(`Order with ID ${orderId} not found`);
    }

    order.markPaid(paymentMethod);
    await this.orderRepo.update(order);
    return order;
  }
}

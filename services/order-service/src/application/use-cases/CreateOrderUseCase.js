import { ValidationError } from '@tokonusa/common';
import { Order } from '../../domain/entities/Order.js';

export class CreateOrderUseCase {
  constructor({ orderRepo }) {
    this.orderRepo = orderRepo;
  }

  async execute(userId, orderData) {
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      throw new ValidationError('User ID is required to create an order');
    }

    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      throw new ValidationError('Order must contain at least one item');
    }

    const order = new Order({
      ...orderData,
      userId,
    });

    return await this.orderRepo.create(order);
  }
}

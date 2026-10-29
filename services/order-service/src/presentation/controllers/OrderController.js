import { ValidationError, UnauthorizedError, createApiResponse } from '@tokonusa/common';
import {
  createOrderSchema,
  simulatePaymentSchema,
  updateOrderStatusSchema,
} from '../validators/orderValidators.js';

function getUserId(req, required = true) {
  const userId = req.headers['x-user-id'] || req.user?.id;
  if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
    if (required) {
      throw new UnauthorizedError('Authentication required: missing x-user-id header');
    }
    return null;
  }
  return userId.trim();
}

export class OrderController {
  constructor({
    createOrderUseCase,
    getOrdersUseCase,
    getOrderDetailUseCase,
    simulatePaymentUseCase,
    updateOrderStatusUseCase,
    getCourierRatesUseCase,
  }) {
    this.createOrderUseCase = createOrderUseCase;
    this.getOrdersUseCase = getOrdersUseCase;
    this.getOrderDetailUseCase = getOrderDetailUseCase;
    this.simulatePaymentUseCase = simulatePaymentUseCase;
    this.updateOrderStatusUseCase = updateOrderStatusUseCase;
    this.getCourierRatesUseCase = getCourierRatesUseCase;
  }

  createOrder = async (req, res, next) => {
    try {
      const userId = getUserId(req, true);
      const parsed = createOrderSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError(
          parsed.error.errors[0]?.message || 'Invalid order payload',
          parsed.error.errors
        );
      }

      const order = await this.createOrderUseCase.execute(userId, parsed.data);
      res.status(201).json(createApiResponse(true, order.toJSON()));
    } catch (err) {
      next(err);
    }
  };

  getOrders = async (req, res, next) => {
    try {
      const userId = getUserId(req, true);
      const { status } = req.query;
      const orders = await this.getOrdersUseCase.execute(userId, { status });
      res.status(200).json(createApiResponse(true, orders.map(o => o.toJSON())));
    } catch (err) {
      next(err);
    }
  };

  getOrderDetail = async (req, res, next) => {
    try {
      const userId = getUserId(req, true);
      const { id } = req.params;
      const order = await this.getOrderDetailUseCase.execute(id, userId);
      res.status(200).json(createApiResponse(true, order.toJSON()));
    } catch (err) {
      next(err);
    }
  };

  simulatePayment = async (req, res, next) => {
    try {
      const userId = getUserId(req, false);
      const { id } = req.params;
      const parsed = simulatePaymentSchema.safeParse(req.body || {});
      if (!parsed.success) {
        throw new ValidationError(
          parsed.error.errors[0]?.message || 'Invalid payment payload',
          parsed.error.errors
        );
      }

      const order = await this.simulatePaymentUseCase.execute(id, {
        paymentMethod: parsed.data?.paymentMethod,
        userId,
      });

      res.status(200).json(createApiResponse(true, order.toJSON()));
    } catch (err) {
      next(err);
    }
  };

  updateStatus = async (req, res, next) => {
    try {
      const userId = getUserId(req, false);
      const { id } = req.params;
      const parsed = updateOrderStatusSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError(
          parsed.error.errors[0]?.message || 'Invalid status update payload',
          parsed.error.errors
        );
      }

      const order = await this.updateOrderStatusUseCase.execute(id, {
        status: parsed.data.status,
        note: parsed.data.note,
        userId,
      });

      res.status(200).json(createApiResponse(true, order.toJSON()));
    } catch (err) {
      next(err);
    }
  };

  getCourierRates = async (req, res, next) => {
    try {
      const { courier } = req.query;
      const rates = await this.getCourierRatesUseCase.execute({ courier });
      res.status(200).json(createApiResponse(true, rates));
    } catch (err) {
      next(err);
    }
  };
}

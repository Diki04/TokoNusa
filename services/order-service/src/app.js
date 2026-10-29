import express from 'express';
import cors from 'cors';
import {
  DomainError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  createApiResponse,
} from '@tokonusa/common';
import { CreateOrderUseCase } from './application/use-cases/CreateOrderUseCase.js';
import { GetOrdersUseCase } from './application/use-cases/GetOrdersUseCase.js';
import { GetOrderDetailUseCase } from './application/use-cases/GetOrderDetailUseCase.js';
import { SimulatePaymentUseCase } from './application/use-cases/SimulatePaymentUseCase.js';
import { UpdateOrderStatusUseCase } from './application/use-cases/UpdateOrderStatusUseCase.js';
import { GetCourierRatesUseCase } from './application/use-cases/GetCourierRatesUseCase.js';
import { OrderController } from './presentation/controllers/OrderController.js';
import { createOrderRoutes } from './presentation/routes/orderRoutes.js';

export function createApp({ orderRepo }) {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json(
      createApiResponse(true, {
        service: 'order-service',
        status: 'healthy',
        timestamp: new Date().toISOString(),
      })
    );
  });

  // Use cases
  const createOrderUseCase = new CreateOrderUseCase({ orderRepo });
  const getOrdersUseCase = new GetOrdersUseCase({ orderRepo });
  const getOrderDetailUseCase = new GetOrderDetailUseCase({ orderRepo });
  const simulatePaymentUseCase = new SimulatePaymentUseCase({ orderRepo });
  const updateOrderStatusUseCase = new UpdateOrderStatusUseCase({ orderRepo });
  const getCourierRatesUseCase = new GetCourierRatesUseCase();

  // Controller
  const orderController = new OrderController({
    createOrderUseCase,
    getOrdersUseCase,
    getOrderDetailUseCase,
    simulatePaymentUseCase,
    updateOrderStatusUseCase,
    getCourierRatesUseCase,
  });

  // Routes
  const orderRoutes = createOrderRoutes({ orderController });
  app.use('/api/orders', orderRoutes);

  // Centralized error handling middleware
  app.use((err, req, res, next) => {
    let statusCode = 500;
    let errorCode = 'INTERNAL_SERVER_ERROR';

    if (err instanceof ValidationError) {
      statusCode = 400;
      errorCode = err.code || 'VALIDATION_ERROR';
    } else if (err instanceof UnauthorizedError) {
      statusCode = 401;
      errorCode = err.code || 'UNAUTHORIZED';
    } else if (err instanceof ForbiddenError) {
      statusCode = 403;
      errorCode = err.code || 'FORBIDDEN';
    } else if (err instanceof NotFoundError) {
      statusCode = 404;
      errorCode = err.code || 'NOT_FOUND';
    } else if (err instanceof ConflictError) {
      statusCode = 409;
      errorCode = err.code || 'CONFLICT';
    } else if (err instanceof DomainError) {
      statusCode = 400;
      errorCode = err.code || 'DOMAIN_ERROR';
    }

    const errorPayload = {
      message: err.message || 'Internal Server Error',
      code: errorCode,
      details: err.details || null,
    };

    res.status(statusCode).json(createApiResponse(false, null, errorPayload));
  });

  return app;
}

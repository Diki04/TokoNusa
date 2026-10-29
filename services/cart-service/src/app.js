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
import { GetCartUseCase } from './application/use-cases/GetCartUseCase.js';
import { AddToCartUseCase } from './application/use-cases/AddToCartUseCase.js';
import { UpdateCartQuantityUseCase } from './application/use-cases/UpdateCartQuantityUseCase.js';
import { RemoveCartItemUseCase } from './application/use-cases/RemoveCartItemUseCase.js';
import { ToggleSelectItemUseCase } from './application/use-cases/ToggleSelectItemUseCase.js';
import { ClearCartUseCase } from './application/use-cases/ClearCartUseCase.js';
import { CartController } from './presentation/controllers/CartController.js';
import { createCartRoutes } from './presentation/routes/cartRoutes.js';

export function createApp({ cartRepo }) {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json(
      createApiResponse(true, {
        service: 'cart-service',
        status: 'healthy',
        timestamp: new Date().toISOString(),
      })
    );
  });

  // Use cases
  const getCartUseCase = new GetCartUseCase({ cartRepo });
  const addToCartUseCase = new AddToCartUseCase({ cartRepo });
  const updateCartQuantityUseCase = new UpdateCartQuantityUseCase({ cartRepo });
  const removeCartItemUseCase = new RemoveCartItemUseCase({ cartRepo });
  const toggleSelectItemUseCase = new ToggleSelectItemUseCase({ cartRepo });
  const clearCartUseCase = new ClearCartUseCase({ cartRepo });

  // Controller
  const cartController = new CartController({
    getCartUseCase,
    addToCartUseCase,
    updateCartQuantityUseCase,
    removeCartItemUseCase,
    toggleSelectItemUseCase,
    clearCartUseCase,
  });

  // Routes
  const cartRoutes = createCartRoutes({ cartController });
  app.use('/api/cart', cartRoutes);

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

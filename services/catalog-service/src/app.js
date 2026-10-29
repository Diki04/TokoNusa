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
import { GetProductsUseCase } from './application/use-cases/GetProductsUseCase.js';
import { GetProductDetailUseCase } from './application/use-cases/GetProductDetailUseCase.js';
import { GetCategoriesUseCase } from './application/use-cases/GetCategoriesUseCase.js';
import { CreateProductUseCase } from './application/use-cases/CreateProductUseCase.js';
import { AddReviewUseCase } from './application/use-cases/AddReviewUseCase.js';
import { CatalogController } from './presentation/controllers/CatalogController.js';
import { createCatalogRoutes } from './presentation/routes/catalogRoutes.js';

export function createApp({ catalogRepo }) {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json(
      createApiResponse(true, {
        service: 'catalog-service',
        status: 'healthy',
        timestamp: new Date().toISOString(),
      })
    );
  });

  // Use cases
  const getProductsUseCase = new GetProductsUseCase({ catalogRepo });
  const getProductDetailUseCase = new GetProductDetailUseCase({ catalogRepo });
  const getCategoriesUseCase = new GetCategoriesUseCase({ catalogRepo });
  const createProductUseCase = new CreateProductUseCase({ catalogRepo });
  const addReviewUseCase = new AddReviewUseCase({ catalogRepo });

  // Controller
  const catalogController = new CatalogController({
    getProductsUseCase,
    getProductDetailUseCase,
    getCategoriesUseCase,
    createProductUseCase,
    addReviewUseCase,
  });

  // Routes
  const catalogRoutes = createCatalogRoutes({ catalogController });
  app.use('/api/catalog', catalogRoutes);

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

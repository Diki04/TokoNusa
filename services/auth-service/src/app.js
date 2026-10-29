import express from 'express';
import cors from 'cors';
import {
  DomainError,
  ValidationError,
  UnauthorizedError,
  NotFoundError,
  ConflictError,
  createApiResponse,
} from '@tokonusa/common';
import { BcryptHasher } from './infrastructure/security/BcryptHasher.js';
import { JwtTokenProvider } from './infrastructure/security/JwtTokenProvider.js';
import { RegisterUserUseCase } from './application/use-cases/RegisterUserUseCase.js';
import { LoginUserUseCase } from './application/use-cases/LoginUserUseCase.js';
import { GetUserProfileUseCase } from './application/use-cases/GetUserProfileUseCase.js';
import { AddAddressUseCase } from './application/use-cases/AddAddressUseCase.js';
import { AuthController } from './presentation/controllers/AuthController.js';
import { createAuthRoutes } from './presentation/routes/authRoutes.js';

export function createApp({
  userRepo,
  jwtSecret = process.env.JWT_SECRET || 'tokonusa-jwt-secret-key-super-secure',
  hasher = new BcryptHasher(),
  tokenProvider = new JwtTokenProvider(jwtSecret),
}) {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json(
      createApiResponse(true, {
        service: 'auth-service',
        status: 'healthy',
        timestamp: new Date().toISOString(),
      })
    );
  });

  // Use cases
  const registerUserUseCase = new RegisterUserUseCase({
    userRepo,
    passwordHasher: hasher,
    tokenProvider,
  });
  const loginUserUseCase = new LoginUserUseCase({
    userRepo,
    passwordHasher: hasher,
    tokenProvider,
  });
  const getUserProfileUseCase = new GetUserProfileUseCase({ userRepo });
  const addAddressUseCase = new AddAddressUseCase({ userRepo });

  // Controller
  const authController = new AuthController({
    registerUserUseCase,
    loginUserUseCase,
    getUserProfileUseCase,
    addAddressUseCase,
  });

  // Routes
  const authRoutes = createAuthRoutes({ authController, tokenProvider });
  app.use('/api/auth', authRoutes);

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

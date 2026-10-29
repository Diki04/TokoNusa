import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createApiResponse } from '@tokonusa/common';
import { createRateLimiter } from './middlewares/rateLimiter.js';
import { createAuthProxy } from './middlewares/authProxy.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { createServiceProxy } from './proxy/serviceProxy.js';

/**
 * Creates and configures the Express API Gateway application.
 */
export function createApp({
  jwtSecret = process.env.JWT_SECRET || 'tokonusa-jwt-secret-key-super-secure',
  serviceTargets = {},
  corsOrigin = process.env.CORS_ORIGIN || '*',
  generalRateLimit = 100,
  authRateLimit = 10,
  windowMs = 60 * 1000,
} = {}) {
  const app = express();

  // 1. Helmet security headers
  app.use(
    helmet({
      xFrameOptions: { action: 'deny' },
      xContentTypeOptions: true,
    })
  );

  // 2. CORS configuration
  app.use(
    cors({
      origin: corsOrigin === '*' ? true : corsOrigin,
      credentials: true,
    })
  );

  // 3. Rate Limiting:
  // General rate limiter: 100 req/min applied to all endpoints
  const generalRateLimiter = createRateLimiter({
    windowMs,
    max: generalRateLimit,
    message: 'Too many requests, please try again later',
  });
  app.use(generalRateLimiter);

  // Auth rate limiter: 10 req/min specifically for authentication endpoints
  const authRateLimiter = createRateLimiter({
    windowMs,
    max: authRateLimit,
    message: 'Too many requests to authentication endpoints, please try again later',
  });
  app.use('/api/auth', authRateLimiter);

  // 4. Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json(
      createApiResponse(true, {
        service: 'api-gateway',
        status: 'healthy',
        timestamp: new Date().toISOString(),
      })
    );
  });

  // 5. Centralized JWT token extraction & identity propagation
  const authProxyMiddleware = createAuthProxy({ jwtSecret });
  app.use(authProxyMiddleware);

  // 6. Reverse Proxy to microservices
  const serviceProxyRouter = createServiceProxy({ serviceTargets });
  app.use(serviceProxyRouter);

  // 7. Not Found handler for unmatched gateway routes
  app.use(notFoundHandler);

  // 8. Centralized error handling
  app.use(errorHandler);

  return app;
}

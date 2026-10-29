import { Router } from 'express';
import { UnauthorizedError } from '@tokonusa/common';
import {
  registerSchema,
  loginSchema,
  addressSchema,
  validateBody,
} from '../validators/authValidators.js';

export function createAuthRoutes({ authController, tokenProvider }) {
  const router = Router();

  const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new UnauthorizedError('Authentication token required'));
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = tokenProvider.verify(token);
      req.user = decoded;
      next();
    } catch (err) {
      next(err);
    }
  };

  router.post('/register', validateBody(registerSchema), authController.register);
  router.post('/login', validateBody(loginSchema), authController.login);
  router.get('/me', authenticate, authController.getProfile);
  router.post('/addresses', authenticate, validateBody(addressSchema), authController.addAddress);

  return router;
}

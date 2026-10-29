import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '@tokonusa/common';

/**
 * Creates authentication and identity propagation middleware for the API Gateway.
 * Validates incoming Bearer JWT tokens, removes any spoofed identity headers,
 * and sets trusted x-user-id, x-user-email, and x-user-role headers for downstream services.
 */
export function createAuthProxy({
  jwtSecret = process.env.JWT_SECRET || 'tokonusa-jwt-secret-key-super-secure',
} = {}) {
  return (req, res, next) => {
    // Strip client-supplied identity headers to prevent header injection/spoofing
    delete req.headers['x-user-id'];
    delete req.headers['x-user-email'];
    delete req.headers['x-user-role'];

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      req.user = null;
      return next();
    }

    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (!match) {
      return next(new UnauthorizedError('Invalid authorization header format'));
    }

    const token = match[1].trim();

    try {
      const decoded = jwt.verify(token, jwtSecret);
      req.user = decoded;

      const userId = decoded.id ?? decoded.userId ?? decoded.sub;
      if (userId !== undefined && userId !== null) {
        req.headers['x-user-id'] = String(userId);
      }
      if (decoded.email) {
        req.headers['x-user-email'] = String(decoded.email);
      }
      if (decoded.role) {
        req.headers['x-user-role'] = String(decoded.role);
      }

      next();
    } catch (err) {
      next(new UnauthorizedError('Invalid or expired authentication token'));
    }
  };
}

export const authProxy = createAuthProxy();

export function signToken(payload, secret = process.env.JWT_SECRET || 'tokonusa-jwt-secret-key-super-secure', options = { expiresIn: '1h' }) {
  return jwt.sign(payload, secret, options);
}

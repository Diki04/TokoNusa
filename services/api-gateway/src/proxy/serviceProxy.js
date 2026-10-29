import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { createApiResponse } from '@tokonusa/common';

/**
 * Creates reverse proxy routing middleware forwarding requests to respective microservices.
 */
export function createServiceProxy({ serviceTargets = {} } = {}) {
  const router = Router();

  const targets = {
    auth: serviceTargets.auth || process.env.AUTH_SERVICE_URL || 'http://localhost:4001',
    catalog: serviceTargets.catalog || process.env.CATALOG_SERVICE_URL || 'http://localhost:4002',
    cart: serviceTargets.cart || process.env.CART_SERVICE_URL || 'http://localhost:4003',
    orders: serviceTargets.orders || serviceTargets.order || process.env.ORDER_SERVICE_URL || 'http://localhost:4004',
  };

  const createServiceProxyMiddleware = (pathFilter, target) => {
    return createProxyMiddleware({
      target,
      changeOrigin: true,
      pathFilter,
      on: {
        proxyReq: (proxyReq, req, res) => {
          // Propagate user identity headers if authenticated; ensure removed if not
          if (req.headers['x-user-id']) {
            proxyReq.setHeader('x-user-id', req.headers['x-user-id']);
          } else {
            proxyReq.removeHeader('x-user-id');
          }

          if (req.headers['x-user-email']) {
            proxyReq.setHeader('x-user-email', req.headers['x-user-email']);
          } else {
            proxyReq.removeHeader('x-user-email');
          }

          if (req.headers['x-user-role']) {
            proxyReq.setHeader('x-user-role', req.headers['x-user-role']);
          } else {
            proxyReq.removeHeader('x-user-role');
          }
        },
        error: (err, req, res) => {
          if (!res.headersSent) {
            res.status(502).json(
              createApiResponse(false, null, {
                message: 'Bad gateway: downstream service unreachable',
                code: 'BAD_GATEWAY',
                details: {
                  error: err.message,
                  target,
                  path: req.originalUrl || req.url,
                },
              })
            );
          }
        },
      },
    });
  };

  // Mount reverse proxies matching service path prefixes
  router.use(createServiceProxyMiddleware('/api/auth', targets.auth));
  router.use(createServiceProxyMiddleware('/api/catalog', targets.catalog));
  router.use(createServiceProxyMiddleware('/api/cart', targets.cart));
  router.use(createServiceProxyMiddleware('/api/orders', targets.orders));

  return router;
}

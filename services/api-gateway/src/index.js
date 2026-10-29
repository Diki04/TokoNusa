import { createApp } from './app.js';

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'tokonusa-jwt-secret-key-super-secure';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

const serviceTargets = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:4001',
  catalog: process.env.CATALOG_SERVICE_URL || 'http://localhost:4002',
  cart: process.env.CART_SERVICE_URL || 'http://localhost:4003',
  order: process.env.ORDER_SERVICE_URL || 'http://localhost:4004',
};

const app = createApp({
  jwtSecret: JWT_SECRET,
  serviceTargets,
  corsOrigin: CORS_ORIGIN,
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[api-gateway] Running on port ${PORT}`);
    console.log(`[api-gateway] Auth Target:    ${serviceTargets.auth}`);
    console.log(`[api-gateway] Catalog Target: ${serviceTargets.catalog}`);
    console.log(`[api-gateway] Cart Target:    ${serviceTargets.cart}`);
    console.log(`[api-gateway] Order Target:   ${serviceTargets.order}`);
  });
}

export { app };

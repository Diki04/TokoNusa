import { Router } from 'express';

export function createOrderRoutes({ orderController }) {
  const router = Router();

  // Courier rates (must be defined before /:id)
  router.get('/couriers', orderController.getCourierRates);

  // Orders CRUD & actions
  router.post('/', orderController.createOrder);
  router.get('/', orderController.getOrders);
  router.get('/:id', orderController.getOrderDetail);
  router.post('/:id/pay', orderController.simulatePayment);
  router.put('/:id/status', orderController.updateStatus);

  return router;
}

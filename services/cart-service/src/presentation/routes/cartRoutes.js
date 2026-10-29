import { Router } from 'express';

export function createCartRoutes({ cartController }) {
  const router = Router();

  router.get('/', cartController.getCart);
  router.post('/items', cartController.addItem);
  router.put('/items/:id/quantity', cartController.updateQuantity);
  router.put('/items/:id/select', cartController.toggleSelect);
  router.put('/select-all', cartController.selectAll);
  router.delete('/clear-selected', cartController.clearSelected);
  router.delete('/clear', cartController.clearAll);
  router.delete('/items/:id', cartController.removeItem);

  return router;
}

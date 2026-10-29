import { Router } from 'express';

export function createCatalogRoutes({ catalogController }) {
  const router = Router();

  router.get('/products', catalogController.getProducts);
  router.get('/products/:idOrSlug', catalogController.getProductDetail);
  router.get('/categories', catalogController.getCategories);
  router.post('/products', catalogController.createProduct);
  router.post('/products/:id/reviews', catalogController.addReview);

  return router;
}

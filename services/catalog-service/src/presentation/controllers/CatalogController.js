import { ValidationError, createApiResponse } from '@tokonusa/common';
import {
  queryProductsSchema,
  createProductSchema,
  addReviewSchema,
} from '../validators/catalogValidators.js';

export class CatalogController {
  constructor({
    getProductsUseCase,
    getProductDetailUseCase,
    getCategoriesUseCase,
    createProductUseCase,
    addReviewUseCase,
  }) {
    this.getProductsUseCase = getProductsUseCase;
    this.getProductDetailUseCase = getProductDetailUseCase;
    this.getCategoriesUseCase = getCategoriesUseCase;
    this.createProductUseCase = createProductUseCase;
    this.addReviewUseCase = addReviewUseCase;
  }

  getProducts = async (req, res, next) => {
    try {
      const parsed = queryProductsSchema.safeParse(req.query);
      if (!parsed.success) {
        throw new ValidationError('Invalid query parameters', parsed.error.errors);
      }

      const result = await this.getProductsUseCase.execute(parsed.data);
      res.status(200).json(createApiResponse(true, result));
    } catch (err) {
      next(err);
    }
  };

  getProductDetail = async (req, res, next) => {
    try {
      const { idOrSlug } = req.params;
      const product = await this.getProductDetailUseCase.execute(idOrSlug);
      res.status(200).json(createApiResponse(true, product));
    } catch (err) {
      next(err);
    }
  };

  getCategories = async (req, res, next) => {
    try {
      const categories = await this.getCategoriesUseCase.execute();
      res.status(200).json(createApiResponse(true, categories));
    } catch (err) {
      next(err);
    }
  };

  createProduct = async (req, res, next) => {
    try {
      const parsed = createProductSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError(
          parsed.error.errors[0]?.message || 'Invalid product payload',
          parsed.error.errors
        );
      }

      const userId = req.headers['x-user-id'] || 'seller-system';
      const role = req.headers['x-user-role'] || '';

      const product = await this.createProductUseCase.execute(parsed.data, {
        userId,
        role,
      });

      res.status(201).json(createApiResponse(true, product));
    } catch (err) {
      next(err);
    }
  };

  addReview = async (req, res, next) => {
    try {
      const parsed = addReviewSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError(
          parsed.error.errors[0]?.message || 'Invalid review payload',
          parsed.error.errors
        );
      }

      const productId = req.params.id;
      const review = await this.addReviewUseCase.execute({
        productId,
        userName: parsed.data.userName || parsed.data.user_name,
        rating: parsed.data.rating,
        comment: parsed.data.comment,
      });

      res.status(201).json(createApiResponse(true, review));
    } catch (err) {
      next(err);
    }
  };
}

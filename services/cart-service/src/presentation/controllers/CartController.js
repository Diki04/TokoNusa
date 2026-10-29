import { ValidationError, UnauthorizedError, createApiResponse } from '@tokonusa/common';
import {
  addItemSchema,
  updateQuantitySchema,
  toggleSelectSchema,
  selectAllSchema,
} from '../validators/cartValidators.js';

function getUserId(req) {
  const userId = req.headers['x-user-id'] || req.user?.id;
  if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
    throw new UnauthorizedError('Authentication required: missing x-user-id header');
  }
  return userId.trim();
}

export class CartController {
  constructor({
    getCartUseCase,
    addToCartUseCase,
    updateCartQuantityUseCase,
    removeCartItemUseCase,
    toggleSelectItemUseCase,
    clearCartUseCase,
  }) {
    this.getCartUseCase = getCartUseCase;
    this.addToCartUseCase = addToCartUseCase;
    this.updateCartQuantityUseCase = updateCartQuantityUseCase;
    this.removeCartItemUseCase = removeCartItemUseCase;
    this.toggleSelectItemUseCase = toggleSelectItemUseCase;
    this.clearCartUseCase = clearCartUseCase;
  }

  getCart = async (req, res, next) => {
    try {
      const userId = getUserId(req);
      const cart = await this.getCartUseCase.execute(userId);
      res.status(200).json(createApiResponse(true, cart));
    } catch (err) {
      next(err);
    }
  };

  addItem = async (req, res, next) => {
    try {
      const userId = getUserId(req);
      const parsed = addItemSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError(
          parsed.error.errors[0]?.message || 'Invalid cart item payload',
          parsed.error.errors
        );
      }

      const { item, isMerged } = await this.addToCartUseCase.execute(userId, parsed.data);
      const statusCode = isMerged ? 200 : 201;
      res.status(statusCode).json(createApiResponse(true, item.toJSON()));
    } catch (err) {
      next(err);
    }
  };

  updateQuantity = async (req, res, next) => {
    try {
      const userId = getUserId(req);
      const { id } = req.params;
      const parsed = updateQuantitySchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError(
          parsed.error.errors[0]?.message || 'Invalid quantity',
          parsed.error.errors
        );
      }

      const item = await this.updateCartQuantityUseCase.execute(userId, id, parsed.data.quantity);
      res.status(200).json(createApiResponse(true, item.toJSON()));
    } catch (err) {
      next(err);
    }
  };

  toggleSelect = async (req, res, next) => {
    try {
      const userId = getUserId(req);
      const { id } = req.params;
      const parsed = toggleSelectSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError(
          parsed.error.errors[0]?.message || 'Invalid selection payload',
          parsed.error.errors
        );
      }

      const isSelected = parsed.data.isSelected !== undefined ? parsed.data.isSelected : parsed.data.is_selected;
      const item = await this.toggleSelectItemUseCase.execute(userId, id, isSelected);
      res.status(200).json(createApiResponse(true, item.toJSON()));
    } catch (err) {
      next(err);
    }
  };

  selectAll = async (req, res, next) => {
    try {
      const userId = getUserId(req);
      const parsed = selectAllSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError(
          parsed.error.errors[0]?.message || 'Invalid select-all payload',
          parsed.error.errors
        );
      }

      const isSelected = parsed.data.isSelected !== undefined ? parsed.data.isSelected : parsed.data.is_selected;
      const result = await this.toggleSelectItemUseCase.selectAll(userId, isSelected);
      res.status(200).json(createApiResponse(true, result));
    } catch (err) {
      next(err);
    }
  };

  removeItem = async (req, res, next) => {
    try {
      const userId = getUserId(req);
      const { id } = req.params;
      const result = await this.removeCartItemUseCase.execute(userId, id);
      res.status(200).json(createApiResponse(true, result));
    } catch (err) {
      next(err);
    }
  };

  clearSelected = async (req, res, next) => {
    try {
      const userId = getUserId(req);
      const result = await this.clearCartUseCase.execute(userId, { onlySelected: true });
      res.status(200).json(createApiResponse(true, result));
    } catch (err) {
      next(err);
    }
  };

  clearAll = async (req, res, next) => {
    try {
      const userId = getUserId(req);
      const result = await this.clearCartUseCase.execute(userId, { onlySelected: false });
      res.status(200).json(createApiResponse(true, result));
    } catch (err) {
      next(err);
    }
  };
}

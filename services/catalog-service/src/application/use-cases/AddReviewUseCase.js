import crypto from 'node:crypto';
import { NotFoundError } from '@tokonusa/common';
import { Review } from '../../domain/entities/Review.js';

export class AddReviewUseCase {
  constructor({ catalogRepo }) {
    this.catalogRepo = catalogRepo;
  }

  async execute({ productId, userName, rating, comment }) {
    const product = await this.catalogRepo.findById(productId);
    if (!product) {
      throw new NotFoundError(`Product not found with id: ${productId}`);
    }

    const review = new Review({
      id: crypto.randomUUID(),
      productId,
      userName,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    });

    return await this.catalogRepo.addReview(review.toJSON());
  }
}

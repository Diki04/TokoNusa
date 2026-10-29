import { ValidationError } from '@tokonusa/common';

export class Review {
  constructor({
    id,
    productId,
    product_id,
    userName,
    user_name,
    rating,
    comment,
    createdAt = new Date().toISOString(),
    created_at = new Date().toISOString(),
  }) {
    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      throw new ValidationError('Rating must be an integer between 1 and 5');
    }

    const name = userName || user_name;
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new ValidationError('Reviewer name cannot be empty');
    }

    if (!comment || typeof comment !== 'string' || comment.trim().length === 0) {
      throw new ValidationError('Review comment cannot be empty');
    }

    this.id = id;
    this.product_id = product_id || productId;
    this.productId = this.product_id;
    this.user_name = name.trim();
    this.userName = this.user_name;
    this.rating = Math.round(numRating);
    this.comment = comment.trim();
    this.created_at = created_at || createdAt;
    this.createdAt = this.created_at;
  }

  toJSON() {
    return {
      id: this.id,
      product_id: this.product_id,
      productId: this.productId,
      user_name: this.user_name,
      userName: this.userName,
      rating: this.rating,
      comment: this.comment,
      created_at: this.created_at,
      createdAt: this.createdAt,
    };
  }
}

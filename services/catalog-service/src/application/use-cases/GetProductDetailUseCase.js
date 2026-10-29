import { NotFoundError } from '@tokonusa/common';

export class GetProductDetailUseCase {
  constructor({ catalogRepo }) {
    this.catalogRepo = catalogRepo;
  }

  async execute(idOrSlug) {
    if (!idOrSlug) {
      throw new NotFoundError('Product identifier is required');
    }

    const product = await this.catalogRepo.findByIdOrSlug(idOrSlug);
    if (!product) {
      throw new NotFoundError(`Product not found with id or slug: ${idOrSlug}`);
    }

    return product;
  }
}

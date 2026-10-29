export class GetProductsUseCase {
  constructor({ catalogRepo }) {
    this.catalogRepo = catalogRepo;
  }

  async execute(filters = {}) {
    return await this.catalogRepo.findAll(filters);
  }
}

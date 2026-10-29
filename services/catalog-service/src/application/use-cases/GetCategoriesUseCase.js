export class GetCategoriesUseCase {
  constructor({ catalogRepo }) {
    this.catalogRepo = catalogRepo;
  }

  async execute() {
    return await this.catalogRepo.findAllCategories();
  }
}

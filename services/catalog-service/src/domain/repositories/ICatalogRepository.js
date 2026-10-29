export class ICatalogRepository {
  async findAll(options = {}) {
    throw new Error('Method not implemented: findAll');
  }

  async findByIdOrSlug(idOrSlug) {
    throw new Error('Method not implemented: findByIdOrSlug');
  }

  async findById(id) {
    throw new Error('Method not implemented: findById');
  }

  async findAllCategories() {
    throw new Error('Method not implemented: findAllCategories');
  }

  async findCategoryById(id) {
    throw new Error('Method not implemented: findCategoryById');
  }

  async createProduct(productData) {
    throw new Error('Method not implemented: createProduct');
  }

  async addReview(reviewData) {
    throw new Error('Method not implemented: addReview');
  }
}

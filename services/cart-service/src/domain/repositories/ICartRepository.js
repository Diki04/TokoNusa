export class ICartRepository {
  async findByUserId(userId) {
    throw new Error('Method not implemented: findByUserId');
  }

  async findById(id) {
    throw new Error('Method not implemented: findById');
  }

  async findByProductAndVariant(userId, productId, variantId = null) {
    throw new Error('Method not implemented: findByProductAndVariant');
  }

  async save(cartItem) {
    throw new Error('Method not implemented: save');
  }

  async delete(id) {
    throw new Error('Method not implemented: delete');
  }

  async deleteSelected(userId) {
    throw new Error('Method not implemented: deleteSelected');
  }

  async clearByUserId(userId) {
    throw new Error('Method not implemented: clearByUserId');
  }

  async updateSelectAll(userId, isSelected) {
    throw new Error('Method not implemented: updateSelectAll');
  }
}

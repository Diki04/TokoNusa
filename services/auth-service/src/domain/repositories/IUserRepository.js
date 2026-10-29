export class IUserRepository {
  async findById(id) {
    throw new Error('Method not implemented: findById');
  }

  async findByEmail(email) {
    throw new Error('Method not implemented: findByEmail');
  }

  async create(userData) {
    throw new Error('Method not implemented: create');
  }

  async update(id, userData) {
    throw new Error('Method not implemented: update');
  }

  async addAddress(addressData) {
    throw new Error('Method not implemented: addAddress');
  }

  async getAddressesByUserId(userId) {
    throw new Error('Method not implemented: getAddressesByUserId');
  }

  async findAddressById(addressId) {
    throw new Error('Method not implemented: findAddressById');
  }
}

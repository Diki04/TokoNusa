export class IOrderRepository {
  async create(order) {
    throw new Error('Method not implemented: create');
  }

  async findById(id) {
    throw new Error('Method not implemented: findById');
  }

  async findByUserId(userId, options = {}) {
    throw new Error('Method not implemented: findByUserId');
  }

  async update(order) {
    throw new Error('Method not implemented: update');
  }

  async addTimelineEntry(orderId, timelineEntry) {
    throw new Error('Method not implemented: addTimelineEntry');
  }
}

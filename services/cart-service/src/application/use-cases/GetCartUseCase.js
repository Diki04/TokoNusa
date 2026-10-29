export class GetCartUseCase {
  constructor({ cartRepo }) {
    this.cartRepo = cartRepo;
  }

  async execute(userId) {
    const items = await this.cartRepo.findByUserId(userId);

    const groupsMap = new Map();
    let totalAmount = 0;
    let totalQuantity = 0;
    let selectedCount = 0;

    for (const item of items) {
      const itemJson = typeof item.toJSON === 'function' ? item.toJSON() : item;
      const merchantId = itemJson.merchantId || itemJson.merchant_id;
      const merchantName = itemJson.merchantName || itemJson.merchant_name;

      if (!groupsMap.has(merchantId)) {
        groupsMap.set(merchantId, {
          merchantId,
          merchant_id: merchantId,
          merchantName,
          merchant_name: merchantName,
          items: [],
          subtotal: 0,
          totalQuantity: 0,
          itemCount: 0,
        });
      }

      const group = groupsMap.get(merchantId);
      group.items.push(itemJson);
      group.itemCount += 1;
      group.totalQuantity += itemJson.quantity;

      if (itemJson.isSelected) {
        group.subtotal += itemJson.price * itemJson.quantity;
        totalAmount += itemJson.price * itemJson.quantity;
        totalQuantity += itemJson.quantity;
        selectedCount += 1;
      }
    }

    return {
      groups: Array.from(groupsMap.values()),
      totalAmount,
      totalQuantity,
      totalItems: items.length,
      selectedCount,
    };
  }
}

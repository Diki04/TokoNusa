import { IOrderRepository } from '../../domain/repositories/IOrderRepository.js';
import { Order } from '../../domain/entities/Order.js';
import { OrderItem } from '../../domain/entities/OrderItem.js';
import { OrderTimeline } from '../../domain/entities/OrderTimeline.js';

function mapRowToOrderItem(row) {
  if (!row) return null;
  return new OrderItem({
    id: row.id,
    orderId: row.order_id,
    productId: row.product_id,
    productName: row.product_name,
    productImage: row.product_image,
    variantName: row.variant_name,
    price: row.price,
    quantity: row.quantity,
    subtotal: row.subtotal,
  });
}

function mapRowToTimeline(row) {
  if (!row) return null;
  return new OrderTimeline({
    id: row.id,
    orderId: row.order_id,
    status: row.status,
    title: row.title,
    description: row.description,
    timestamp: row.timestamp,
  });
}

function mapRowToOrder(row, items = [], timeline = []) {
  if (!row) return null;
  return new Order({
    id: row.id,
    orderNumber: row.order_number,
    userId: row.user_id,
    merchantId: row.merchant_id,
    merchantName: row.merchant_name,
    totalAmount: row.total_amount,
    shippingCost: row.shipping_cost,
    discountAmount: row.discount_amount,
    grandTotal: row.grand_total,
    shippingCourier: row.shipping_courier,
    shippingService: row.shipping_service,
    shippingAddress: row.shipping_address,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    items,
    timeline,
  });
}

export class SqliteOrderRepository extends IOrderRepository {
  constructor(db) {
    super();
    this.db = db;
  }

  async create(order) {
    const insertOrderSql = `
      INSERT INTO orders (
        id, order_number, user_id, merchant_id, merchant_name,
        total_amount, shipping_cost, discount_amount, grand_total,
        shipping_courier, shipping_service, shipping_address,
        payment_method, payment_status, status,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const insertItemSql = `
      INSERT INTO order_items (
        id, order_id, product_id, product_name, product_image,
        variant_name, price, quantity, subtotal
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const insertTimelineSql = `
      INSERT INTO order_tracking_timeline (
        id, order_id, status, title, description, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;

    this.db.exec('BEGIN TRANSACTION;');
    try {
      this.db.prepare(insertOrderSql).run(
        order.id,
        order.orderNumber,
        order.userId,
        order.merchantId,
        order.merchantName,
        order.totalAmount,
        order.shippingCost,
        order.discountAmount,
        order.grandTotal,
        order.shippingCourier,
        order.shippingService,
        order.shippingAddress,
        order.paymentMethod,
        order.paymentStatus,
        order.status,
        order.createdAt,
        order.updatedAt
      );

      const itemStmt = this.db.prepare(insertItemSql);
      for (const item of order.items) {
        itemStmt.run(
          item.id,
          order.id,
          item.productId,
          item.productName,
          item.productImage,
          item.variantName,
          item.price,
          item.quantity,
          item.subtotal
        );
      }

      const timelineStmt = this.db.prepare(insertTimelineSql);
      for (const t of order.timeline) {
        timelineStmt.run(
          t.id,
          order.id,
          t.status,
          t.title,
          t.description,
          t.timestamp
        );
      }

      this.db.exec('COMMIT;');
      return this.findById(order.id);
    } catch (err) {
      this.db.exec('ROLLBACK;');
      throw err;
    }
  }

  async findById(id) {
    const orderSql = `SELECT * FROM orders WHERE id = ? LIMIT 1`;
    const orderRow = this.db.prepare(orderSql).get(id);
    if (!orderRow) return null;

    const itemsSql = `SELECT * FROM order_items WHERE order_id = ? ORDER BY rowid ASC`;
    const itemRows = this.db.prepare(itemsSql).all(id);
    const items = itemRows.map(mapRowToOrderItem);

    const timelineSql = `SELECT * FROM order_tracking_timeline WHERE order_id = ? ORDER BY timestamp ASC, rowid ASC`;
    const timelineRows = this.db.prepare(timelineSql).all(id);
    const timeline = timelineRows.map(mapRowToTimeline);

    return mapRowToOrder(orderRow, items, timeline);
  }

  async findByUserId(userId, options = {}) {
    let sql = `SELECT * FROM orders WHERE user_id = ?`;
    const params = [userId];

    if (options.status) {
      sql += ` AND status = ?`;
      params.push(options.status);
    }

    sql += ` ORDER BY created_at DESC`;

    const orderRows = this.db.prepare(sql).all(...params);
    if (orderRows.length === 0) return [];

    const itemsStmt = this.db.prepare(`SELECT * FROM order_items WHERE order_id = ? ORDER BY rowid ASC`);
    const timelineStmt = this.db.prepare(`SELECT * FROM order_tracking_timeline WHERE order_id = ? ORDER BY timestamp ASC, rowid ASC`);

    return orderRows.map(orderRow => {
      const itemRows = itemsStmt.all(orderRow.id);
      const timelineRows = timelineStmt.all(orderRow.id);
      return mapRowToOrder(
        orderRow,
        itemRows.map(mapRowToOrderItem),
        timelineRows.map(mapRowToTimeline)
      );
    });
  }

  async update(order) {
    const updateOrderSql = `
      UPDATE orders SET
        payment_method = ?,
        payment_status = ?,
        status = ?,
        updated_at = ?
      WHERE id = ?
    `;

    const insertTimelineSql = `
      INSERT OR IGNORE INTO order_tracking_timeline (
        id, order_id, status, title, description, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;

    this.db.exec('BEGIN TRANSACTION;');
    try {
      this.db.prepare(updateOrderSql).run(
        order.paymentMethod,
        order.paymentStatus,
        order.status,
        order.updatedAt,
        order.id
      );

      const timelineStmt = this.db.prepare(insertTimelineSql);
      for (const t of order.timeline) {
        timelineStmt.run(
          t.id,
          order.id,
          t.status,
          t.title,
          t.description,
          t.timestamp
        );
      }

      this.db.exec('COMMIT;');
      return this.findById(order.id);
    } catch (err) {
      this.db.exec('ROLLBACK;');
      throw err;
    }
  }

  async addTimelineEntry(orderId, timelineEntry) {
    const insertTimelineSql = `
      INSERT INTO order_tracking_timeline (
        id, order_id, status, title, description, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;
    const updateOrderSql = `UPDATE orders SET updated_at = ? WHERE id = ?`;

    this.db.exec('BEGIN TRANSACTION;');
    try {
      this.db.prepare(insertTimelineSql).run(
        timelineEntry.id,
        orderId,
        timelineEntry.status,
        timelineEntry.title,
        timelineEntry.description,
        timelineEntry.timestamp
      );
      this.db.prepare(updateOrderSql).run(timelineEntry.timestamp, orderId);
      this.db.exec('COMMIT;');
    } catch (err) {
      this.db.exec('ROLLBACK;');
      throw err;
    }
  }
}

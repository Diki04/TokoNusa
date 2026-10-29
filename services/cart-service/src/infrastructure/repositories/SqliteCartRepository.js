import { ICartRepository } from '../../domain/repositories/ICartRepository.js';
import { CartItem } from '../../domain/entities/CartItem.js';

function mapRowToCartItem(row) {
  if (!row) return null;
  return new CartItem({
    id: row.id,
    userId: row.user_id,
    productId: row.product_id,
    merchantId: row.merchant_id,
    merchantName: row.merchant_name,
    productName: row.product_name,
    productImage: row.product_image,
    variantId: row.variant_id,
    variantName: row.variant_name,
    price: row.price,
    quantity: row.quantity,
    isSelected: row.is_selected === 1 || row.is_selected === true,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

export class SqliteCartRepository extends ICartRepository {
  constructor(db) {
    super();
    this.db = db;
  }

  async findByUserId(userId) {
    const sql = `
      SELECT * FROM cart_items
      WHERE user_id = ?
      ORDER BY created_at ASC
    `;
    const rows = this.db.prepare(sql).all(userId);
    return rows.map(mapRowToCartItem);
  }

  async findById(id) {
    const sql = `SELECT * FROM cart_items WHERE id = ? LIMIT 1`;
    const row = this.db.prepare(sql).get(id);
    return mapRowToCartItem(row);
  }

  async findByProductAndVariant(userId, productId, variantId = null) {
    const sql = `
      SELECT * FROM cart_items
      WHERE user_id = ? AND product_id = ? AND variant_id IS ?
      LIMIT 1
    `;
    const row = this.db.prepare(sql).get(userId, productId, variantId);
    return mapRowToCartItem(row);
  }

  async save(cartItem) {
    const sql = `
      INSERT INTO cart_items (
        id, user_id, product_id, merchant_id, merchant_name, product_name,
        product_image, variant_id, variant_name, price, quantity, is_selected,
        notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        price = excluded.price,
        quantity = excluded.quantity,
        is_selected = excluded.is_selected,
        notes = excluded.notes,
        updated_at = excluded.updated_at
    `;
    this.db.prepare(sql).run(
      cartItem.id,
      cartItem.userId,
      cartItem.productId,
      cartItem.merchantId,
      cartItem.merchantName,
      cartItem.productName,
      cartItem.productImage,
      cartItem.variantId,
      cartItem.variantName,
      cartItem.price,
      cartItem.quantity,
      cartItem.isSelected ? 1 : 0,
      cartItem.notes,
      cartItem.createdAt,
      cartItem.updatedAt
    );
    return cartItem;
  }

  async delete(id) {
    const sql = `DELETE FROM cart_items WHERE id = ?`;
    this.db.prepare(sql).run(id);
    return true;
  }

  async deleteSelected(userId) {
    const sql = `DELETE FROM cart_items WHERE user_id = ? AND is_selected = 1`;
    this.db.prepare(sql).run(userId);
    return true;
  }

  async clearByUserId(userId) {
    const sql = `DELETE FROM cart_items WHERE user_id = ?`;
    this.db.prepare(sql).run(userId);
    return true;
  }

  async updateSelectAll(userId, isSelected) {
    const sql = `
      UPDATE cart_items
      SET is_selected = ?, updated_at = ?
      WHERE user_id = ?
    `;
    this.db.prepare(sql).run(isSelected ? 1 : 0, new Date().toISOString(), userId);
    return true;
  }
}

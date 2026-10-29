import { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import { User } from '../../domain/entities/User.js';
import { Address } from '../../domain/entities/Address.js';

export class SqliteUserRepository extends IUserRepository {
  constructor(db) {
    super();
    this.db = db;
  }

  _mapUser(row) {
    if (!row) return null;
    return new User({
      id: row.id,
      name: row.name,
      email: row.email,
      passwordHash: row.password_hash,
      role: row.role,
      phone: row.phone,
      avatarUrl: row.avatar_url,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  _mapAddress(row) {
    if (!row) return null;
    return new Address({
      id: row.id,
      userId: row.user_id,
      receiverName: row.receiver_name,
      phone: row.phone,
      street: row.street,
      city: row.city,
      province: row.province,
      postalCode: row.postal_code,
      isPrimary: Boolean(row.is_primary),
      createdAt: row.created_at,
    });
  }

  async findById(id) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    const row = stmt.get(id);
    return this._mapUser(row);
  }

  async findByEmail(email) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
    const row = stmt.get(email);
    return this._mapUser(row);
  }

  async create(userData) {
    const stmt = this.db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, phone, avatar_url, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);
    stmt.run(
      userData.id,
      userData.name,
      userData.email,
      userData.passwordHash,
      userData.role || 'BUYER',
      userData.phone || null,
      userData.avatarUrl || null
    );
    return this.findById(userData.id);
  }

  async update(id, userData) {
    const fields = [];
    const values = [];

    if (userData.name !== undefined) {
      fields.push('name = ?');
      values.push(userData.name);
    }
    if (userData.phone !== undefined) {
      fields.push('phone = ?');
      values.push(userData.phone);
    }
    if (userData.avatarUrl !== undefined) {
      fields.push('avatar_url = ?');
      values.push(userData.avatarUrl);
    }
    if (userData.role !== undefined) {
      fields.push('role = ?');
      values.push(userData.role);
    }
    if (userData.passwordHash !== undefined) {
      fields.push('password_hash = ?');
      values.push(userData.passwordHash);
    }

    if (fields.length > 0) {
      fields.push("updated_at = datetime('now')");
      values.push(id);
      const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
      this.db.prepare(sql).run(...values);
    }

    return this.findById(id);
  }

  async addAddress(addressData) {
    this.db.exec('BEGIN TRANSACTION;');
    try {
      if (addressData.isPrimary) {
        this.db
          .prepare('UPDATE user_addresses SET is_primary = 0 WHERE user_id = ?')
          .run(addressData.userId);
      }

      const stmt = this.db.prepare(`
        INSERT INTO user_addresses (id, user_id, receiver_name, phone, street, city, province, postal_code, is_primary, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `);

      stmt.run(
        addressData.id,
        addressData.userId,
        addressData.receiverName,
        addressData.phone,
        addressData.street,
        addressData.city,
        addressData.province,
        addressData.postalCode,
        addressData.isPrimary ? 1 : 0
      );

      this.db.exec('COMMIT;');
    } catch (err) {
      this.db.exec('ROLLBACK;');
      throw err;
    }

    return this.findAddressById(addressData.id);
  }

  async getAddressesByUserId(userId) {
    const stmt = this.db.prepare(
      'SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_primary DESC, created_at DESC'
    );
    const rows = stmt.all(userId);
    return rows.map((r) => this._mapAddress(r));
  }

  async findAddressById(addressId) {
    const stmt = this.db.prepare('SELECT * FROM user_addresses WHERE id = ?');
    const row = stmt.get(addressId);
    return this._mapAddress(row);
  }
}

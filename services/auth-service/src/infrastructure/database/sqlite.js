import { DatabaseSync } from 'node:sqlite';

export function createAuthDatabase(dbPath = 'auth.db') {
  const db = new DatabaseSync(dbPath);
  if (dbPath !== ':memory:') {
    db.exec('PRAGMA journal_mode = WAL;');
    db.exec('PRAGMA synchronous = NORMAL;');
  }
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'BUYER',
      phone TEXT,
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_addresses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      receiver_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      street TEXT NOT NULL,
      city TEXT NOT NULL,
      province TEXT NOT NULL,
      postal_code TEXT NOT NULL,
      is_primary INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_addresses_user ON user_addresses(user_id);
  `);

  seedDefaultUsersIfEmpty(db);

  return db;
}

export function seedDefaultUsersIfEmpty(db) {
  const defaultHash = '$2a$08$orxKZGhCv8eCEmMjznnFo.rThURB296G2etiRYUIg4oBitI0vTSyW'; // Password123!

  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (id, name, email, password_hash, role, phone, avatar_url, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  insertUser.run(
    'user-buyer-budi',
    'Budi Santoso',
    'budi.santoso@gmail.com',
    defaultHash,
    'BUYER',
    '081234567890',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
  );

  insertUser.run(
    'merchant-ibox-central',
    'iBox Official Store',
    'seller@ibox.co.id',
    defaultHash,
    'SELLER',
    '081198765432',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80'
  );

  insertUser.run(
    'user-admin-tokonusa',
    'Administrator TokoNusa',
    'admin@tokonusa.com',
    defaultHash,
    'ADMIN',
    '081100001111',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80'
  );
}

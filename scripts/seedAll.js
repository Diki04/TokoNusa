import { fileURLToPath } from 'node:url';
import { createAuthDatabase } from '../services/auth-service/src/infrastructure/database/sqlite.js';
import { BcryptHasher } from '../services/auth-service/src/infrastructure/security/BcryptHasher.js';
import {
  createCatalogDatabase,
  seedCatalogData,
} from '../services/catalog-service/src/infrastructure/database/sqlite.js';
import { seedCategories, seedProducts } from '../services/catalog-service/src/infrastructure/database/seedData.js';
import { createCartDatabase } from '../services/cart-service/src/infrastructure/database/sqlite.js';
import { createOrderDatabase } from '../services/order-service/src/infrastructure/database/sqlite.js';

/**
 * Master database seeder initializing auth.db, catalog.db, cart.db, and orders.db
 * with rich realistic Indonesian e-commerce data.
 */
export async function seedAll(options = {}) {
  const {
    authDbPath = 'auth.db',
    catalogDbPath = 'catalog.db',
    cartDbPath = 'cart.db',
    orderDbPath = 'orders.db',
    silent = false,
  } = options;

  const log = (...args) => {
    if (!silent) console.log(...args);
  };

  log('\n======================================================');
  log('  TokoNusa E-Commerce - Master Database Seeder');
  log('======================================================\n');

  // 1. Seed Auth Service Database
  log('🌱 [1/4] Seeding Auth Database (auth.db)...');
  const authDb = createAuthDatabase(authDbPath);
  const hasher = new BcryptHasher(8); // 8 rounds for rapid test & seed hashing
  const defaultPasswordHash = await hasher.hash('Password123!');

  const users = [
    {
      id: 'user-buyer-budi',
      name: 'Budi Santoso',
      email: 'budi.santoso@gmail.com',
      password_hash: defaultPasswordHash,
      role: 'BUYER',
      phone: '081234567890',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      address: {
        id: 'addr-budi-1',
        receiver_name: 'Budi Santoso',
        phone: '081234567890',
        street: 'Jl. Sudirman No. 45, Karet Semanggi',
        city: 'Jakarta Selatan',
        province: 'DKI Jakarta',
        postal_code: '12190',
        is_primary: 1,
      },
    },
    {
      id: 'merchant-ibox-central',
      name: 'iBox Official Store',
      email: 'seller@ibox.co.id',
      password_hash: defaultPasswordHash,
      role: 'SELLER',
      phone: '081198765432',
      avatar_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
      address: {
        id: 'addr-ibox-1',
        receiver_name: 'iBox Central Store',
        phone: '081198765432',
        street: 'Grand Indonesia Mall East Mall Lt. 3, Jl. M.H. Thamrin No. 1',
        city: 'Jakarta Pusat',
        province: 'DKI Jakarta',
        postal_code: '10310',
        is_primary: 1,
      },
    },
    {
      id: 'user-admin-tokonusa',
      name: 'Administrator TokoNusa',
      email: 'admin@tokonusa.com',
      password_hash: defaultPasswordHash,
      role: 'ADMIN',
      phone: '081100001111',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
      address: null,
    },
  ];

  authDb.exec('BEGIN TRANSACTION;');
  try {
    const insertUser = authDb.prepare(`
      INSERT OR REPLACE INTO users (id, name, email, password_hash, role, phone, avatar_url, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);
    const insertAddress = authDb.prepare(`
      INSERT OR REPLACE INTO user_addresses (id, user_id, receiver_name, phone, street, city, province, postal_code, is_primary)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const u of users) {
      insertUser.run(u.id, u.name, u.email, u.password_hash, u.role, u.phone, u.avatar_url);
      if (u.address) {
        insertAddress.run(
          u.address.id,
          u.id,
          u.address.receiver_name,
          u.address.phone,
          u.address.street,
          u.address.city,
          u.address.province,
          u.address.postal_code,
          u.address.is_primary
        );
      }
    }
    authDb.exec('COMMIT;');
    log(`   ✓ Seeded ${users.length} users (Buyer, Merchant, Admin) & addresses.`);
  } catch (err) {
    authDb.exec('ROLLBACK;');
    throw err;
  }

  // 2. Seed Catalog Service Database
  log('🌱 [2/4] Seeding Catalog Database (catalog.db)...');
  const catalogDb = createCatalogDatabase(catalogDbPath);
  seedCatalogData(catalogDb);
  log(`   ✓ Seeded ${seedCategories.length} categories and ${seedProducts.length} Indonesian products with variants & reviews.`);

  // 3. Seed Cart Service Database
  log('🌱 [3/4] Seeding Cart Database (cart.db)...');
  const cartDb = createCartDatabase(cartDbPath);

  const cartItems = [
    {
      id: 'cart-budi-kopi',
      user_id: 'user-buyer-budi',
      product_id: 'prod-kopi-gayo-specialty',
      merchant_id: 'merchant-kopi-nusantara',
      merchant_name: 'Kopi Nusantara Official',
      product_name: 'Kopi Arabika Gayo Aceh Specialty Grade 1 - 250gr Medium Dark Roast',
      product_image: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=800&q=80',
      variant_id: 'var-gayo-biji',
      variant_name: 'Biji Kopi (Whole Beans)',
      price: 85000,
      quantity: 2,
      is_selected: 1,
      notes: 'Roasting fresh ya min',
    },
    {
      id: 'cart-budi-ventela',
      user_id: 'user-buyer-budi',
      product_id: 'prod-ventela-public-low',
      merchant_id: 'merchant-ventela-id',
      merchant_name: 'Ventela Indonesia',
      product_name: 'Ventela Public Low Black Natural Sepatu Sneakers Pria Wanita Original',
      product_image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80',
      variant_id: 'var-ventela-42',
      variant_name: 'Size 42 (27.0 cm)',
      price: 249000,
      quantity: 1,
      is_selected: 1,
      notes: null,
    },
  ];

  cartDb.exec('BEGIN TRANSACTION;');
  try {
    const insertCart = cartDb.prepare(`
      INSERT OR REPLACE INTO cart_items (
        id, user_id, product_id, merchant_id, merchant_name, product_name,
        product_image, variant_id, variant_name, price, quantity, is_selected, notes, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    for (const item of cartItems) {
      insertCart.run(
        item.id,
        item.user_id,
        item.product_id,
        item.merchant_id,
        item.merchant_name,
        item.product_name,
        item.product_image,
        item.variant_id,
        item.variant_name,
        item.price,
        item.quantity,
        item.is_selected,
        item.notes
      );
    }
    cartDb.exec('COMMIT;');
    log(`   ✓ Seeded ${cartItems.length} active cart items for Budi Santoso.`);
  } catch (err) {
    cartDb.exec('ROLLBACK;');
    throw err;
  }

  // 4. Seed Order Service Database
  log('🌱 [4/4] Seeding Orders Database (orders.db)...');
  const orderDb = createOrderDatabase(orderDbPath);

  const initialOrders = [
    {
      id: 'order-budi-001',
      order_number: 'ORD-20261028-0001',
      user_id: 'user-buyer-budi',
      merchant_id: 'merchant-ibox-central',
      merchant_name: 'iBox Official Store',
      total_amount: 23999000,
      shipping_cost: 25000,
      discount_amount: 0,
      grand_total: 24024000,
      shipping_courier: 'JNE',
      shipping_service: 'YES',
      shipping_address: 'Budi Santoso (081234567890), Jl. Sudirman No. 45, Karet Semanggi, Jakarta Selatan, DKI Jakarta 12190',
      payment_method: 'QRIS',
      payment_status: 'SUDAH_DIBAYAR',
      status: 'SELESAI',
      items: [
        {
          id: 'item-budi-001',
          product_id: 'prod-iphone-16-pro-max',
          product_name: 'Apple iPhone 16 Pro Max 256GB Natural Titanium (Garansi Resmi iBox)',
          product_image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
          variant_name: 'Natural Titanium 256GB',
          price: 23999000,
          quantity: 1,
          subtotal: 23999000,
        },
      ],
      timeline: [
        {
          id: 'time-budi-001-1',
          status: 'MENUNGGU_PEMBAYARAN',
          title: 'Pesanan Dibuat',
          description: 'Menunggu pembayaran via QRIS',
          timestamp: '2026-10-28 09:00:00',
        },
        {
          id: 'time-budi-001-2',
          status: 'DIPROSES',
          title: 'Pembayaran Berhasil',
          description: 'Pembayaran QRIS sebesar Rp 24.024.000 telah diverifikasi',
          timestamp: '2026-10-28 09:05:00',
        },
        {
          id: 'time-budi-001-3',
          status: 'DIKIRIM',
          title: 'Pesanan Dikirim',
          description: 'Paket diserahkan ke JNE. No. Resi: JNE8829102910ID',
          timestamp: '2026-10-28 13:45:00',
        },
        {
          id: 'time-budi-001-4',
          status: 'SELESAI',
          title: 'Pesanan Selesai',
          description: 'Paket telah diterima oleh penerima (Budi Santoso)',
          timestamp: '2026-10-29 10:30:00',
        },
      ],
    },
    {
      id: 'order-budi-002',
      order_number: 'ORD-20261029-0002',
      user_id: 'user-buyer-budi',
      merchant_id: 'merchant-batik-keris',
      merchant_name: 'Batik Keris Official',
      total_amount: 475000,
      shipping_cost: 18000,
      discount_amount: 0,
      grand_total: 493000,
      shipping_courier: 'SiCepat',
      shipping_service: 'Reguler',
      shipping_address: 'Budi Santoso (081234567890), Jl. Sudirman No. 45, Karet Semanggi, Jakarta Selatan, DKI Jakarta 12190',
      payment_method: 'BCA Virtual Account',
      payment_status: 'SUDAH_DIBAYAR',
      status: 'DIKIRIM',
      items: [
        {
          id: 'item-budi-002',
          product_id: 'prod-batik-keris-parang',
          product_name: 'Batik Keris Kemeja Pria Lengan Panjang Motif Parang Rusak Barong',
          product_image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
          variant_name: 'Size L',
          price: 475000,
          quantity: 1,
          subtotal: 475000,
        },
      ],
      timeline: [
        {
          id: 'time-budi-002-1',
          status: 'MENUNGGU_PEMBAYARAN',
          title: 'Pesanan Dibuat',
          description: 'Menunggu pembayaran via BCA Virtual Account',
          timestamp: '2026-10-29 08:00:00',
        },
        {
          id: 'time-budi-002-2',
          status: 'DIPROSES',
          title: 'Pembayaran Berhasil',
          description: 'Pembayaran via BCA VA sebesar Rp 493.000 telah diverifikasi',
          timestamp: '2026-10-29 08:02:00',
        },
        {
          id: 'time-budi-002-3',
          status: 'DIKIRIM',
          title: 'Pesanan Dikirim',
          description: 'Paket diserahkan ke kurir SiCepat. No. Resi: SC9911882200ID',
          timestamp: '2026-10-29 11:15:00',
        },
      ],
    },
  ];

  orderDb.exec('BEGIN TRANSACTION;');
  try {
    const insertOrder = orderDb.prepare(`
      INSERT OR REPLACE INTO orders (
        id, order_number, user_id, merchant_id, merchant_name, total_amount, shipping_cost,
        discount_amount, grand_total, shipping_courier, shipping_service, shipping_address,
        payment_method, payment_status, status, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    const insertOrderItem = orderDb.prepare(`
      INSERT OR REPLACE INTO order_items (
        id, order_id, product_id, product_name, product_image, variant_name, price, quantity, subtotal
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertTimeline = orderDb.prepare(`
      INSERT OR REPLACE INTO order_tracking_timeline (
        id, order_id, status, title, description, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const ord of initialOrders) {
      insertOrder.run(
        ord.id,
        ord.order_number,
        ord.user_id,
        ord.merchant_id,
        ord.merchant_name,
        ord.total_amount,
        ord.shipping_cost,
        ord.discount_amount,
        ord.grand_total,
        ord.shipping_courier,
        ord.shipping_service,
        ord.shipping_address,
        ord.payment_method,
        ord.payment_status,
        ord.status
      );

      for (const item of ord.items) {
        insertOrderItem.run(
          item.id,
          ord.id,
          item.product_id,
          item.product_name,
          item.product_image,
          item.variant_name,
          item.price,
          item.quantity,
          item.subtotal
        );
      }

      for (const t of ord.timeline) {
        insertTimeline.run(t.id, ord.id, t.status, t.title, t.description, t.timestamp);
      }
    }

    orderDb.exec('COMMIT;');
    log(`   ✓ Seeded ${initialOrders.length} Indonesian orders with tracking timelines.`);
  } catch (err) {
    orderDb.exec('ROLLBACK;');
    throw err;
  }

  log('\n✅ All TokoNusa microservices databases seeded successfully!\n');

  return {
    authDb,
    catalogDb,
    cartDb,
    orderDb,
    usersCount: users.length,
    categoriesCount: seedCategories.length,
    productsCount: seedProducts.length,
    cartItemsCount: cartItems.length,
    ordersCount: initialOrders.length,
  };
}

// Auto-run if executed directly via node scripts/seedAll.js
const isDirectExecution = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isDirectExecution) {
  seedAll()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seeding failed:', err);
      process.exit(1);
    });
}

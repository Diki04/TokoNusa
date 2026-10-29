import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { createAuthDatabase } from '../services/auth-service/src/infrastructure/database/sqlite.js';
import { SqliteUserRepository } from '../services/auth-service/src/infrastructure/repositories/SqliteUserRepository.js';
import { createCatalogDatabase } from '../services/catalog-service/src/infrastructure/database/sqlite.js';
import { SqliteCatalogRepository } from '../services/catalog-service/src/infrastructure/repositories/SqliteCatalogRepository.js';
import { createCartDatabase } from '../services/cart-service/src/infrastructure/database/sqlite.js';
import { SqliteCartRepository } from '../services/cart-service/src/infrastructure/repositories/SqliteCartRepository.js';
import { CartItem } from '../services/cart-service/src/domain/entities/CartItem.js';
import { createOrderDatabase } from '../services/order-service/src/infrastructure/database/sqlite.js';
import { SqliteOrderRepository } from '../services/order-service/src/infrastructure/repositories/SqliteOrderRepository.js';
import { Order } from '../services/order-service/src/domain/entities/Order.js';
import { OrderTimeline } from '../services/order-service/src/domain/entities/OrderTimeline.js';
import { seedAll } from './seedAll.js';

function removeDbFiles(basePath) {
  for (const ext of ['', '-wal', '-shm', '-journal']) {
    const p = basePath + ext;
    if (fs.existsSync(p)) {
      try {
        fs.unlinkSync(p);
      } catch (_) {}
    }
  }
}

/**
 * Executes a high-performance benchmark running 1,000 rapid operations across
 * database-per-service SQLite engines in WAL mode.
 *
 * Asserts:
 * - Average latency < 5.0 ms
 * - 100% success rate
 * - 0 errors
 */
export async function runBenchmark(options = {}) {
  const {
    totalOps = 1000,
    prefix = 'bench',
    cleanup = true,
    silent = false,
  } = options;

  const log = (...args) => {
    if (!silent) console.log(...args);
  };

  const authDbPath = `${prefix}-auth.db`;
  const catalogDbPath = `${prefix}-catalog.db`;
  const cartDbPath = `${prefix}-cart.db`;
  const orderDbPath = `${prefix}-orders.db`;

  // Pre-cleanup if previous benchmark files exist
  removeDbFiles(authDbPath);
  removeDbFiles(catalogDbPath);
  removeDbFiles(cartDbPath);
  removeDbFiles(orderDbPath);

  log('\n======================================================');
  log('  TokoNusa High-Performance SQLite WAL Benchmark');
  log('======================================================\n');
  log(`⚙️  Target Operations: ${totalOps.toLocaleString()} ops`);
  log('⚙️  Architecture: Database-Per-Service (4 SQLite engines in WAL mode)');
  log('⚙️  Target SLA: Average Latency < 5.0ms, 100% Success, 0 Errors\n');

  // Initialize and seed baseline data
  log('📦 Setting up benchmark databases & initial dataset...');
  const seedResult = await seedAll({
    authDbPath,
    catalogDbPath,
    cartDbPath,
    orderDbPath,
    silent: true,
  });

  const { authDb, catalogDb, cartDb, orderDb } = seedResult;

  // Verify WAL journal mode on all databases
  const authMode = authDb.prepare('PRAGMA journal_mode;').get();
  const catalogMode = catalogDb.prepare('PRAGMA journal_mode;').get();
  const cartMode = cartDb.prepare('PRAGMA journal_mode;').get();
  const orderMode = orderDb.prepare('PRAGMA journal_mode;').get();

  log(`   ✓ Journal Modes: Auth=${authMode.journal_mode}, Catalog=${catalogMode.journal_mode}, Cart=${cartMode.journal_mode}, Orders=${orderMode.journal_mode}`);

  const userRepo = new SqliteUserRepository(authDb);
  const catalogRepo = new SqliteCatalogRepository(catalogDb);
  const cartRepo = new SqliteCartRepository(cartDb);
  const orderRepo = new SqliteOrderRepository(orderDb);

  const latencies = [];
  const errors = [];

  const benchStartWall = process.hrtime.bigint();

  // Distribute operations across the 4 services
  // Catalog: 350, Cart: 250, Orders: 250, Auth: 150 (Total = 1,000)
  const opsCatalog = Math.round(totalOps * 0.35);
  const opsCart = Math.round(totalOps * 0.25);
  const opsOrders = Math.round(totalOps * 0.25);
  const opsAuth = totalOps - (opsCatalog + opsCart + opsOrders);

  log(`🚀 Running benchmark across services (Catalog:${opsCatalog}, Cart:${opsCart}, Orders:${opsOrders}, Auth:${opsAuth})...`);

  // 1. Catalog Operations
  for (let i = 0; i < opsCatalog; i++) {
    const t0 = process.hrtime.bigint();
    try {
      const mode = i % 4;
      if (mode === 0) {
        await catalogRepo.findAll({ page: 1, limit: 10, search: 'Kopi' });
      } else if (mode === 1) {
        await catalogRepo.findByIdOrSlug('kopi-arabika-gayo-aceh-specialty-grade-1-250gr-medium-dark-roast');
      } else if (mode === 2) {
        await catalogRepo.findAllCategories();
      } else {
        await catalogRepo.findAll({ page: 1, limit: 10, category: 'cat-gadget', sort: 'price_asc' });
      }
      const t1 = process.hrtime.bigint();
      latencies.push(Number(t1 - t0) / 1_000_000);
    } catch (err) {
      errors.push({ service: 'catalog', iteration: i, error: err.message });
    }
  }

  // 2. Cart Operations
  for (let i = 0; i < opsCart; i++) {
    const t0 = process.hrtime.bigint();
    try {
      const mode = i % 4;
      if (mode === 0) {
        await cartRepo.findByUserId('user-buyer-budi');
      } else if (mode === 1) {
        const item = new CartItem({
          id: `bench-cart-${i}-${crypto.randomBytes(4).toString('hex')}`,
          userId: 'user-buyer-budi',
          productId: 'prod-iphone-16-pro-max',
          merchantId: 'merchant-ibox-central',
          merchantName: 'iBox Official Store',
          productName: 'iPhone 16 Pro Max',
          productImage: '/img.png',
          price: 23999000,
          quantity: (i % 3) + 1,
          isSelected: true,
        });
        await cartRepo.save(item);
      } else if (mode === 2) {
        await cartRepo.findById('cart-budi-kopi');
      } else {
        await cartRepo.updateSelectAll('user-buyer-budi', i % 2 === 0);
      }
      const t1 = process.hrtime.bigint();
      latencies.push(Number(t1 - t0) / 1_000_000);
    } catch (err) {
      errors.push({ service: 'cart', iteration: i, error: err.message });
    }
  }

  // 3. Order Operations
  for (let i = 0; i < opsOrders; i++) {
    const t0 = process.hrtime.bigint();
    try {
      const mode = i % 4;
      if (mode === 0) {
        await orderRepo.findByUserId('user-buyer-budi', {});
      } else if (mode === 1) {
        await orderRepo.findById('order-budi-001');
      } else if (mode === 2) {
        const orderId = `bench-ord-${i}-${crypto.randomBytes(4).toString('hex')}`;
        const newOrder = new Order({
          id: orderId,
          orderNumber: `ORD-BENCH-${i}-${Date.now()}`,
          userId: 'user-buyer-budi',
          merchantId: 'merchant-ibox-central',
          merchantName: 'iBox Official Store',
          totalAmount: 100000,
          shippingCost: 15000,
          discountAmount: 0,
          grandTotal: 115000,
          shippingCourier: 'JNE',
          shippingService: 'Reguler',
          shippingAddress: 'Jl. Jenderal Sudirman No. 45, Jakarta',
          paymentMethod: 'QRIS',
          paymentStatus: 'MENUNGGU_PEMBAYARAN',
          status: 'MENUNGGU_PEMBAYARAN',
          items: [
            {
              id: `item-${orderId}`,
              orderId,
              productId: 'prod-iphone-16-pro-max',
              productName: 'iPhone 16 Pro Max',
              productImage: '/img.png',
              variantName: 'Natural Titanium',
              price: 100000,
              quantity: 1,
              subtotal: 100000,
            },
          ],
        });
        await orderRepo.create(newOrder);
      } else {
        await orderRepo.addTimelineEntry(
          'order-budi-001',
          new OrderTimeline({
            id: `timeline-bench-${i}-${crypto.randomBytes(4).toString('hex')}`,
            orderId: 'order-budi-001',
            status: 'DIKIRIM',
            title: 'Kurir Melakukan Pengantaran',
            description: `Update checkpoint log #${i}`,
            timestamp: new Date().toISOString(),
          })
        );
      }
      const t1 = process.hrtime.bigint();
      latencies.push(Number(t1 - t0) / 1_000_000);
    } catch (err) {
      errors.push({ service: 'orders', iteration: i, error: err.message });
    }
  }

  // 4. Auth Operations
  for (let i = 0; i < opsAuth; i++) {
    const t0 = process.hrtime.bigint();
    try {
      const mode = i % 3;
      if (mode === 0) {
        await userRepo.findByEmail('budi.santoso@gmail.com');
      } else if (mode === 1) {
        await userRepo.findById('user-buyer-budi');
      } else {
        await userRepo.getAddressesByUserId('user-buyer-budi');
      }
      const t1 = process.hrtime.bigint();
      latencies.push(Number(t1 - t0) / 1_000_000);
    } catch (err) {
      errors.push({ service: 'auth', iteration: i, error: err.message });
    }
  }

  const benchEndWall = process.hrtime.bigint();
  const totalDurationMs = Number(benchEndWall - benchStartWall) / 1_000_000;

  // Calculations
  latencies.sort((a, b) => a - b);
  const n = latencies.length;
  const sumLatency = latencies.reduce((acc, val) => acc + val, 0);
  const avgLatency = n > 0 ? sumLatency / n : 0;
  const minLatency = n > 0 ? latencies[0] : 0;
  const p50 = n > 0 ? latencies[Math.floor(n * 0.50)] : 0;
  const p95 = n > 0 ? latencies[Math.floor(n * 0.95)] : 0;
  const p99 = n > 0 ? latencies[Math.floor(n * 0.99)] : 0;
  const maxLatency = n > 0 ? latencies[n - 1] : 0;
  const throughput = totalDurationMs > 0 ? Math.round((n / (totalDurationMs / 1000))) : 0;
  const successRate = totalOps > 0 ? (n / totalOps) * 100 : 0;

  // Teardown / Close DBs
  authDb.close();
  catalogDb.close();
  cartDb.close();
  orderDb.close();

  if (cleanup) {
    removeDbFiles(authDbPath);
    removeDbFiles(catalogDbPath);
    removeDbFiles(cartDbPath);
    removeDbFiles(orderDbPath);
  }

  // Display results
  log('\n📊 ---------------- BENCHMARK RESULTS ----------------');
  log(`   Total Operations:      ${n.toLocaleString()} / ${totalOps.toLocaleString()}`);
  log(`   Success Rate:          ${successRate.toFixed(2)}%`);
  log(`   Total Errors:          ${errors.length}`);
  log(`   Total Wall Duration:   ${totalDurationMs.toFixed(2)} ms`);
  log(`   Throughput:            ${throughput.toLocaleString()} ops/sec\n`);
  log('⏱️  Latency Distribution:');
  log(`   Average Latency:       ${avgLatency.toFixed(3)} ms (Target: < 5.0 ms)`);
  log(`   Min Latency:           ${minLatency.toFixed(3)} ms`);
  log(`   Median (p50):          ${p50.toFixed(3)} ms`);
  log(`   95th Percentile (p95): ${p95.toFixed(3)} ms`);
  log(`   99th Percentile (p99): ${p99.toFixed(3)} ms`);
  log(`   Max Latency:           ${maxLatency.toFixed(3)} ms`);
  log('------------------------------------------------------\n');

  // Verify assertions
  const isAvgLatencyPassing = avgLatency < 5.0;
  const isErrorsZero = errors.length === 0;
  const isSuccessRate100 = successRate === 100;

  if (isAvgLatencyPassing && isErrorsZero && isSuccessRate100) {
    log('🎉 SLA PASSED: Sub-5ms average latency, 100% success rate, 0 errors achieved!\n');
  } else {
    log('⚠️  SLA WARNING/FAILURE:');
    if (!isAvgLatencyPassing) log(`   - Average latency (${avgLatency.toFixed(3)}ms) exceeded target (< 5.0ms)`);
    if (!isErrorsZero) log(`   - Detected ${errors.length} errors during execution`);
    if (!isSuccessRate100) log(`   - Success rate was ${successRate.toFixed(2)}% (expected 100%)`);
    throw new Error(`Benchmark SLA not met: avg=${avgLatency.toFixed(3)}ms, errors=${errors.length}, successRate=${successRate}%`);
  }

  return {
    totalOps,
    successCount: n,
    errorCount: errors.length,
    successRate,
    totalDurationMs,
    throughput,
    latency: {
      avg: avgLatency,
      min: minLatency,
      p50,
      p95,
      p99,
      max: maxLatency,
    },
    errors,
  };
}

// Auto-run if executed directly via node scripts/benchmark.js
const isDirectExecution = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isDirectExecution) {
  runBenchmark()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Benchmark execution failed:', err);
      process.exit(1);
    });
}

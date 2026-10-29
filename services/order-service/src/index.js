import { createOrderDatabase } from './infrastructure/database/sqlite.js';
import { SqliteOrderRepository } from './infrastructure/repositories/SqliteOrderRepository.js';
import { createApp } from './app.js';

const PORT = process.env.PORT || 4004;
const DB_PATH = process.env.DB_PATH || 'orders.db';

const db = createOrderDatabase(DB_PATH);
const orderRepo = new SqliteOrderRepository(db);
const app = createApp({ orderRepo });

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[order-service] Running on port ${PORT}`);
  });
}

export { app, db };

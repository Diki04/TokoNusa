import { createCartDatabase } from './infrastructure/database/sqlite.js';
import { SqliteCartRepository } from './infrastructure/repositories/SqliteCartRepository.js';
import { createApp } from './app.js';

const PORT = process.env.PORT || 4003;
const DB_PATH = process.env.DB_PATH || 'cart.db';

const db = createCartDatabase(DB_PATH);
const cartRepo = new SqliteCartRepository(db);
const app = createApp({ cartRepo });

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[cart-service] Running on port ${PORT}`);
  });
}

export { app, db };

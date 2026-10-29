import { createCatalogDatabase, seedCatalogData } from './infrastructure/database/sqlite.js';
import { SqliteCatalogRepository } from './infrastructure/repositories/SqliteCatalogRepository.js';
import { createApp } from './app.js';

const PORT = process.env.PORT || 4002;
const DB_PATH = process.env.DB_PATH || 'catalog.db';

const db = createCatalogDatabase(DB_PATH);
seedCatalogData(db);

const catalogRepo = new SqliteCatalogRepository(db);
const app = createApp({ catalogRepo });

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[catalog-service] Running on port ${PORT}`);
  });
}

export { app, db };

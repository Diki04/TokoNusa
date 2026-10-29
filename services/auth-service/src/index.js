import { createAuthDatabase } from './infrastructure/database/sqlite.js';
import { SqliteUserRepository } from './infrastructure/repositories/SqliteUserRepository.js';
import { createApp } from './app.js';

const PORT = process.env.PORT || 4001;
const DB_PATH = process.env.DB_PATH || 'auth.db';
const JWT_SECRET = process.env.JWT_SECRET || 'tokonusa-jwt-secret-key-super-secure';

const db = createAuthDatabase(DB_PATH);
const userRepo = new SqliteUserRepository(db);
const app = createApp({ userRepo, jwtSecret: JWT_SECRET });

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[auth-service] Running on port ${PORT}`);
  });
}

export { app };

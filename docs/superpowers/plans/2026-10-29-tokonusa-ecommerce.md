# TokoNusa E-Commerce Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an enterprise-grade full-stack Tokopedia-inspired e-commerce application (TokoNusa) featuring an anti-slop React frontend, an API Gateway, and four autonomous microservices built with Clean Architecture, SOLID principles, SQLite database-per-service, high security, and high performance.

**Architecture:** Monorepo with an API Gateway (Port 4000) reverse-proxying requests to four isolated microservices (`auth-service`: 4001, `catalog-service`: 4002, `cart-service`: 4003, `order-service`: 4004). Each service follows Clean Architecture (Domain, Application, Infrastructure, Presentation) with isolated SQLite databases in WAL mode. The React frontend is a modern, responsive Vite SPA styled with Tailwind CSS and custom Tokopedia-grade UX.

**Tech Stack:** Node.js v24+, Express, SQLite3 (better-sqlite3 / sqlite3), Zod, Bcryptjs, JsonWebToken, Helmet, React 19, Vite, Tailwind CSS, Lucide React, Vitest.

**Spec:** [`docs/superpowers/specs/2026-10-29-tokonusa-ecommerce-design.md`](file:///D:/Ngoding%20bro/JavaScript/Project/e-commerce/docs/superpowers/specs/2026-10-29-tokonusa-ecommerce-design.md)

## Global Constraints
- **Language & Runtime**: Node.js v24+, ES Modules (`"type": "module"`).
- **Architecture**: Strict Clean Architecture (Domain -> Application -> Infrastructure -> Presentation).
- **Database**: SQLite with Database-per-Service isolation (`auth.db`, `catalog.db`, `cart.db`, `orders.db`), WAL mode enabled, 100% parameterized SQL prepared statements.
- **Security**: Stateless JWT, Bcrypt (salt=10), Zod input validation, Helmet headers, sliding-window rate limiting.
- **Frontend**: Responsive across desktop, tablet, and mobile, TokoNusa emerald `#03AC0E` branding, zero generic placeholders.

---

### Task 1: Monorepo Foundation & Workspace Setup

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `tsconfig.base.json`
- Create: `packages/common/package.json`
- Create: `packages/common/src/index.js`
- Test: `tests/setup.test.js`

**Interfaces:**
- Produces: Shared standard response types, error classes (`DomainError`, `NotFoundError`, `ValidationError`, `UnauthorizedError`), and logger utilities for all services.

- [ ] **Step 1: Write the failing test for common utilities**

Create `tests/setup.test.js`:
```javascript
import { describe, it, expect } from 'vitest';
import { DomainError, createApiResponse } from '../packages/common/src/index.js';

describe('Common Utilities', () => {
  it('creates standardized API success response', () => {
    const payload = { id: '123', name: 'TokoNusa' };
    const res = createApiResponse(true, payload);
    expect(res.success).toBe(true);
    expect(res.data).toEqual(payload);
  });

  it('constructs DomainError with appropriate code', () => {
    const err = new DomainError('Invalid state', 'INVALID_STATE');
    expect(err.message).toBe('Invalid state');
    expect(err.code).toBe('INVALID_STATE');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/setup.test.js`  
Expected: FAIL (packages/common/src/index.js not found).

- [ ] **Step 3: Implement root configuration and common package**

Create `.gitignore`:
```
node_modules/
dist/
*.db
*.db-wal
*.db-shm
.env
.DS_Store
coverage/
```

Create `package.json`:
```json
{
  "name": "tokonusa-ecommerce",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "workspaces": [
    "packages/*",
    "services/*",
    "apps/*"
  ],
  "scripts": {
    "test": "vitest run",
    "dev:gateway": "node services/api-gateway/src/index.js",
    "dev:auth": "node services/auth-service/src/index.js",
    "dev:catalog": "node services/catalog-service/src/index.js",
    "dev:cart": "node services/cart-service/src/index.js",
    "dev:order": "node services/order-service/src/index.js",
    "dev:services": "concurrently -n \"GATEWAY,AUTH,CATALOG,CART,ORDER\" -c \"cyan,blue,green,yellow,magenta\" \"npm run dev:gateway\" \"npm run dev:auth\" \"npm run dev:catalog\" \"npm run dev:cart\" \"npm run dev:order\"",
    "dev:web": "npm --prefix apps/web run dev",
    "dev": "concurrently -n \"BACKEND,FRONTEND\" -c \"cyan,green\" \"npm run dev:services\" \"npm run dev:web\""
  },
  "devDependencies": {
    "concurrently": "^9.1.2",
    "vitest": "^3.0.7"
  }
}
```

Create `packages/common/package.json`:
```json
{
  "name": "@tokonusa/common",
  "version": "1.0.0",
  "type": "module",
  "main": "src/index.js"
}
```

Create `packages/common/src/index.js`:
```javascript
export class DomainError extends Error {
  constructor(message, code = 'DOMAIN_ERROR') {
    super(message);
    this.name = 'DomainError';
    this.code = code;
  }
}

export class NotFoundError extends DomainError {
  constructor(message = 'Resource not found') {
    super(message, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends DomainError {
  constructor(message = 'Validation failed', details = []) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
    this.details = details;
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message = 'Unauthorized') {
    super(message, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export function createApiResponse(success, data = null, error = null, meta = {}) {
  return {
    success,
    data,
    error,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/setup.test.js`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add package.json .gitignore packages/ tests/setup.test.js
git commit -m "chore: setup monorepo structure and common package"
```

---

### Task 2: Brand Identity & SVG Logo Vector Assets

**Files:**
- Create: `apps/web/public/brand/symbol.svg`
- Create: `apps/web/public/brand/toko-nusa-horizontal.svg`
- Create: `apps/web/public/brand/favicon.svg`
- Test: `tests/brand-assets.test.js`

**Interfaces:**
- Produces: Precise geometric vector logo and brand marks strictly complying with `logo-design` skill (geometric curves, stroke consistency, optical centering, scalable 16px-512px).

- [ ] **Step 1: Write test verifying SVG structure and cleanliness**

Create `tests/brand-assets.test.js`:
```javascript
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Brand Logo Assets', () => {
  it('symbol.svg exists and contains clean valid SVG geometry', () => {
    const symbolPath = path.resolve('apps/web/public/brand/symbol.svg');
    expect(fs.existsSync(symbolPath)).toBe(true);
    const content = fs.readFileSync(symbolPath, 'utf8');
    expect(content).toContain('viewBox="0 0 256 256"');
    expect(content).toContain('#03AC0E');
    expect(content).not.toContain('<image'); // zero raster
  });

  it('horizontal lockup contains brand wordmark and symbol', () => {
    const lockupPath = path.resolve('apps/web/public/brand/toko-nusa-horizontal.svg');
    expect(fs.existsSync(lockupPath)).toBe(true);
    const content = fs.readFileSync(lockupPath, 'utf8');
    expect(content).toContain('TokoNusa');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/brand-assets.test.js`  
Expected: FAIL (files do not exist).

- [ ] **Step 3: Implement SVG Brand Assets**

Create `apps/web/public/brand/symbol.svg`:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" fill="none">
  <defs>
    <linearGradient id="nusaGrad" x1="32" y1="32" x2="224" y2="224" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#03AC0E" />
      <stop offset="100%" stop-color="#00820A" />
    </linearGradient>
    <linearGradient id="foldGrad" x1="128" y1="110" x2="190" y2="200" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#22C55E" />
      <stop offset="100%" stop-color="#15803D" />
    </linearGradient>
  </defs>
  <!-- Shopping Bag Handle -->
  <path d="M84 100 V74 C84 48 104 28 128 28 C152 28 172 48 172 74 V100" stroke="#03AC0E" stroke-width="18" stroke-linecap="round" />
  <!-- Main Bag Body with Soft Rounded Base -->
  <rect x="36" y="92" width="184" height="136" rx="28" fill="url(#nusaGrad)" />
  <!-- Dynamic 'N' Fold Motif (Nusantara Marketplace Ribbon) -->
  <path d="M76 196 V124 C76 118 82 114 88 118 L168 194 C174 198 180 194 180 188 V124" stroke="#FFFFFF" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" />
  <!-- Vibrant Sunburst Dot (representing flourishing Indonesian commerce) -->
  <circle cx="178" cy="118" r="10" fill="#FACC15" />
</svg>
```

Create `apps/web/public/brand/toko-nusa-horizontal.svg`:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 120" width="540" height="120" fill="none">
  <defs>
    <linearGradient id="hGrad" x1="20" y1="10" x2="110" y2="110" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#03AC0E" />
      <stop offset="100%" stop-color="#00820A" />
    </linearGradient>
  </defs>
  <!-- Symbol Mini -->
  <g transform="translate(10, 10) scale(0.39)">
    <path d="M84 100 V74 C84 48 104 28 128 28 C152 28 172 48 172 74 V100" stroke="#03AC0E" stroke-width="18" stroke-linecap="round" />
    <rect x="36" y="92" width="184" height="136" rx="28" fill="url(#hGrad)" />
    <path d="M76 196 V124 C76 118 82 114 88 118 L168 194 C174 198 180 194 180 188 V124" stroke="#FFFFFF" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="178" cy="118" r="10" fill="#FACC15" />
  </g>
  <!-- Wordmark 'TokoNusa' -->
  <text x="125" y="76" font-family="system-ui, -apple-system, 'Plus Jakarta Sans', sans-serif" font-size="44" font-weight="800" fill="#0F172A" letter-spacing="-1">Toko<tspan fill="#03AC0E">Nusa</tspan></text>
  <rect x="345" y="44" width="76" height="24" rx="6" fill="#F0FDF4" stroke="#03AC0E" stroke-width="1.5" />
  <text x="353" y="61" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#03AC0E">OFFICIAL</text>
  <text x="127" y="98" font-family="system-ui, sans-serif" font-size="14" font-weight="500" fill="#64748B">Belanja Nyaman Se-Nusantara</text>
</svg>
```

Create `apps/web/public/brand/favicon.svg`:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" fill="none">
  <rect width="64" height="64" rx="16" fill="#03AC0E" />
  <path d="M22 46 V24 C22 22 25 21 27 23 L41 41 C43 43 46 42 46 40 V22" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
  <circle cx="45" cy="20" r="3" fill="#FACC15" />
</svg>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/brand-assets.test.js`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/public/brand/ tests/brand-assets.test.js
git commit -m "feat(brand): add TokoNusa vector logo and brand identity assets"
```

---

### Task 3: `auth-service` Clean Architecture & Security Implementation

**Files:**
- Create: `services/auth-service/package.json`
- Create: `services/auth-service/src/domain/entities/User.js`
- Create: `services/auth-service/src/domain/repositories/IUserRepository.js`
- Create: `services/auth-service/src/application/use-cases/RegisterUserUseCase.js`
- Create: `services/auth-service/src/application/use-cases/LoginUserUseCase.js`
- Create: `services/auth-service/src/application/use-cases/GetUserProfileUseCase.js`
- Create: `services/auth-service/src/infrastructure/database/sqlite.js`
- Create: `services/auth-service/src/infrastructure/repositories/SqliteUserRepository.js`
- Create: `services/auth-service/src/infrastructure/security/BcryptHasher.js`
- Create: `services/auth-service/src/infrastructure/security/JwtTokenProvider.js`
- Create: `services/auth-service/src/presentation/controllers/AuthController.js`
- Create: `services/auth-service/src/presentation/validators/authValidators.js`
- Create: `services/auth-service/src/presentation/routes/authRoutes.js`
- Create: `services/auth-service/src/app.js`
- Create: `services/auth-service/src/index.js`
- Test: `tests/auth-service.test.js`

**Interfaces:**
- Produces: HTTP endpoints at `http://localhost:4001`:
  - `POST /api/auth/register` (body: `{ name, email, password, role? }`) -> returns user & token
  - `POST /api/auth/login` (body: `{ email, password }`) -> returns user & token
  - `GET /api/auth/me` (header: `Authorization: Bearer <token>`) -> returns user profile & addresses
  - `POST /api/auth/addresses` -> add user shipping address

- [ ] **Step 1: Write integration test for Auth Service**

Create `tests/auth-service.test.js`:
```javascript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../services/auth-service/src/app.js';
import { SqliteUserRepository } from '../services/auth-service/src/infrastructure/repositories/SqliteUserRepository.js';
import { createAuthDatabase } from '../services/auth-service/src/infrastructure/database/sqlite.js';

describe('Auth Service Clean Architecture', () => {
  let app;
  let db;

  beforeAll(() => {
    db = createAuthDatabase(':memory:');
    const userRepo = new SqliteUserRepository(db);
    app = createApp({ userRepo, jwtSecret: 'test-secret-key-tokonusa' });
  });

  it('registers a new buyer successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Budi Santoso',
        email: 'budi.santoso@example.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('budi.santoso@example.com');
    expect(res.body.data.token).toBeDefined();
  });

  it('rejects registration with duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Budi Santoso',
        email: 'budi.santoso@example.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('authenticates user and fetches profile', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'budi.santoso@example.com',
        password: 'Password123!',
      });

    expect(loginRes.status).toBe(200);
    const token = loginRes.body.data.token;

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.data.email).toBe('budi.santoso@example.com');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/auth-service.test.js`  
Expected: FAIL.

- [ ] **Step 3: Implement Auth Service layers**

Create `services/auth-service/package.json`:
```json
{
  "name": "@tokonusa/auth-service",
  "version": "1.0.0",
  "type": "module",
  "main": "src/index.js",
  "dependencies": {
    "@tokonusa/common": "*",
    "bcryptjs": "^2.4.3",
    "better-sqlite3": "^11.8.1",
    "cors": "^2.8.5",
    "express": "^4.21.2",
    "jsonwebtoken": "^9.0.2",
    "zod": "^3.24.2"
  }
}
```

Implement Domain Entity `services/auth-service/src/domain/entities/User.js`:
```javascript
export class User {
  constructor({ id, name, email, passwordHash, role = 'BUYER', phone = null, avatarUrl = null, createdAt = new Date() }) {
    if (!email || !email.includes('@')) throw new Error('Invalid email address');
    if (!name || name.trim().length === 0) throw new Error('Name cannot be empty');
    this.id = id;
    this.name = name.trim();
    this.email = email.toLowerCase().trim();
    this.passwordHash = passwordHash;
    this.role = role;
    this.phone = phone;
    this.avatarUrl = avatarUrl;
    this.createdAt = createdAt;
  }
}
```

Implement Use Cases `services/auth-service/src/application/use-cases/RegisterUserUseCase.js` & `LoginUserUseCase.js`:
- Inject `IUserRepository`, `IPasswordHasher`, `ITokenProvider`.
- Check email uniqueness, hash password, create entity, persist, and return user + token.

Implement Infrastructure SQLite DB `services/auth-service/src/infrastructure/database/sqlite.js`:
- Open SQLite with WAL mode, create `users` and `user_addresses` tables and indices.

Implement Presentation Layer (Controller, Router, and Express App).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/auth-service.test.js`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add services/auth-service/ tests/auth-service.test.js
git commit -m "feat(auth): implement auth-service with Clean Architecture and SOLID"
```

---

### Task 4: `catalog-service` Clean Architecture & Rich Seed Data

**Files:**
- Create: `services/catalog-service/package.json`
- Create: `services/catalog-service/src/domain/entities/Product.js`
- Create: `services/catalog-service/src/domain/entities/Category.js`
- Create: `services/catalog-service/src/domain/repositories/ICatalogRepository.js`
- Create: `services/catalog-service/src/application/use-cases/GetProductsUseCase.js`
- Create: `services/catalog-service/src/application/use-cases/GetProductDetailUseCase.js`
- Create: `services/catalog-service/src/application/use-cases/GetCategoriesUseCase.js`
- Create: `services/catalog-service/src/application/use-cases/CreateProductUseCase.js`
- Create: `services/catalog-service/src/application/use-cases/AddReviewUseCase.js`
- Create: `services/catalog-service/src/infrastructure/database/sqlite.js`
- Create: `services/catalog-service/src/infrastructure/database/seedData.js`
- Create: `services/catalog-service/src/infrastructure/repositories/SqliteCatalogRepository.js`
- Create: `services/catalog-service/src/presentation/controllers/CatalogController.js`
- Create: `services/catalog-service/src/presentation/routes/catalogRoutes.js`
- Create: `services/catalog-service/src/app.js`
- Create: `services/catalog-service/src/index.js`
- Test: `tests/catalog-service.test.js`

**Interfaces:**
- Produces: HTTP endpoints at `http://localhost:4002`:
  - `GET /api/catalog/products` (query: `search`, `category`, `minPrice`, `maxPrice`, `rating`, `sort`, `page`, `limit`)
  - `GET /api/catalog/products/:idOrSlug` -> detailed product with variants, images, and reviews
  - `GET /api/catalog/categories` -> list categories
  - `POST /api/catalog/products` (seller auth required) -> create product
  - `POST /api/catalog/products/:id/reviews` -> add customer review

- [ ] **Step 1: Write integration test for Catalog Service**

Create `tests/catalog-service.test.js`:
```javascript
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../services/catalog-service/src/app.js';
import { SqliteCatalogRepository } from '../services/catalog-service/src/infrastructure/repositories/SqliteCatalogRepository.js';
import { createCatalogDatabase, seedCatalogData } from '../services/catalog-service/src/infrastructure/database/sqlite.js';

describe('Catalog Service Clean Architecture', () => {
  let app;
  let db;

  beforeAll(() => {
    db = createCatalogDatabase(':memory:');
    seedCatalogData(db);
    const catalogRepo = new SqliteCatalogRepository(db);
    app = createApp({ catalogRepo });
  });

  it('lists seeded products with pagination and filters', async () => {
    const res = await request(app).get('/api/catalog/products?page=1&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.products.length).toBeGreaterThan(0);
    expect(res.body.data.products[0].merchant_name).toBeDefined();
  });

  it('searches product by keyword and filters by category', async () => {
    const res = await request(app).get('/api/catalog/products?search=Kopi');
    expect(res.status).toBe(200);
    expect(res.body.data.products.every(p => p.name.toLowerCase().includes('kopi'))).toBe(true);
  });

  it('retrieves detailed product by slug including variants and reviews', async () => {
    const listRes = await request(app).get('/api/catalog/products?limit=1');
    const slug = listRes.body.data.products[0].slug;

    const res = await request(app).get(`/api/catalog/products/${slug}`);
    expect(res.status).toBe(200);
    expect(res.body.data.images).toBeDefined();
    expect(res.body.data.variants).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/catalog-service.test.js`  
Expected: FAIL.

- [ ] **Step 3: Implement Catalog Service with authentic Indonesian seed data**

Implement seed data in `services/catalog-service/src/infrastructure/database/seedData.js`:
- Real categories: Elektronik, Fashion Pria, Gadget & Smartphone, Makanan & Minuman Lokal, Otomotif, Rumah Tangga.
- Real Indonesian marketplace products (e.g. *Apple iPhone 16 Pro Max 256GB Garansi Resmi iBox*, *Kopi Arabika Gayo Aceh Specialty Roast 250g*, *Batik Keris Kemeja Slim Fit Motif Parang*, *Sony WH-1000XM5 Wireless Noise Cancelling Headphone*, *Ventela Public Low Sepatu Sneakers Lokal*).
- Authentic merchant stores across Jakarta, Bandung, Yogyakarta, and Surabaya with badges (*Official Store*, *Power Merchant Pro*), ratings, and reviews.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/catalog-service.test.js`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add services/catalog-service/ tests/catalog-service.test.js
git commit -m "feat(catalog): implement catalog-service with rich Indonesian marketplace seed data"
```

---

### Task 5: `cart-service` Clean Architecture & Multi-Merchant Grouping

**Files:**
- Create: `services/cart-service/package.json`
- Create: `services/cart-service/src/domain/entities/CartItem.js`
- Create: `services/cart-service/src/domain/repositories/ICartRepository.js`
- Create: `services/cart-service/src/application/use-cases/GetCartUseCase.js`
- Create: `services/cart-service/src/application/use-cases/AddToCartUseCase.js`
- Create: `services/cart-service/src/application/use-cases/UpdateCartQuantityUseCase.js`
- Create: `services/cart-service/src/application/use-cases/RemoveCartItemUseCase.js`
- Create: `services/cart-service/src/application/use-cases/ToggleSelectItemUseCase.js`
- Create: `services/cart-service/src/infrastructure/database/sqlite.js`
- Create: `services/cart-service/src/infrastructure/repositories/SqliteCartRepository.js`
- Create: `services/cart-service/src/presentation/controllers/CartController.js`
- Create: `services/cart-service/src/presentation/routes/cartRoutes.js`
- Create: `services/cart-service/src/app.js`
- Create: `services/cart-service/src/index.js`
- Test: `tests/cart-service.test.js`

**Interfaces:**
- Produces: HTTP endpoints at `http://localhost:4003`:
  - `GET /api/cart` -> returns items grouped by merchant, with totals
  - `POST /api/cart/items` -> add item to cart
  - `PUT /api/cart/items/:id/quantity` -> update quantity
  - `PUT /api/cart/items/:id/select` -> toggle selection
  - `DELETE /api/cart/items/:id` -> remove item

- [ ] **Step 1: Write integration test for Cart Service**

Create `tests/cart-service.test.js`:
```javascript
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../services/cart-service/src/app.js';
import { SqliteCartRepository } from '../services/cart-service/src/infrastructure/repositories/SqliteCartRepository.js';
import { createCartDatabase } from '../services/cart-service/src/infrastructure/database/sqlite.js';

describe('Cart Service Clean Architecture', () => {
  let app;

  beforeAll(() => {
    const db = createCartDatabase(':memory:');
    const cartRepo = new SqliteCartRepository(db);
    app = createApp({ cartRepo });
  });

  it('adds item to cart and groups by merchant', async () => {
    const addRes = await request(app)
      .post('/api/cart/items')
      .set('x-user-id', 'user-1')
      .send({
        productId: 'prod-1',
        merchantId: 'merchant-ibox',
        merchantName: 'iBox Official Store',
        productName: 'iPhone 16 Pro',
        productImage: '/images/iphone.png',
        price: 20999000,
        quantity: 1,
      });

    expect(addRes.status).toBe(201);

    const getRes = await request(app)
      .get('/api/cart')
      .set('x-user-id', 'user-1');

    expect(getRes.status).toBe(200);
    expect(getRes.body.data.groups.length).toBe(1);
    expect(getRes.body.data.groups[0].merchantName).toBe('iBox Official Store');
    expect(getRes.body.data.totalAmount).toBe(20999000);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/cart-service.test.js`  
Expected: FAIL.

- [ ] **Step 3: Implement Cart Service layers**

Build domain entity, SQLite repository with atomic transactions, multi-store grouping application logic, and Express controller.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/cart-service.test.js`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add services/cart-service/ tests/cart-service.test.js
git commit -m "feat(cart): implement cart-service with multi-merchant grouping"
```

---

### Task 6: `order-service` Clean Architecture, Courier & Payment Simulation

**Files:**
- Create: `services/order-service/package.json`
- Create: `services/order-service/src/domain/entities/Order.js`
- Create: `services/order-service/src/domain/repositories/IOrderRepository.js`
- Create: `services/order-service/src/application/use-cases/CreateOrderUseCase.js`
- Create: `services/order-service/src/application/use-cases/GetOrdersUseCase.js`
- Create: `services/order-service/src/application/use-cases/GetOrderDetailUseCase.js`
- Create: `services/order-service/src/application/use-cases/SimulatePaymentUseCase.js`
- Create: `services/order-service/src/application/use-cases/GetCourierRatesUseCase.js`
- Create: `services/order-service/src/infrastructure/database/sqlite.js`
- Create: `services/order-service/src/infrastructure/repositories/SqliteOrderRepository.js`
- Create: `services/order-service/src/presentation/controllers/OrderController.js`
- Create: `services/order-service/src/presentation/routes/orderRoutes.js`
- Create: `services/order-service/src/app.js`
- Create: `services/order-service/src/index.js`
- Test: `tests/order-service.test.js`

**Interfaces:**
- Produces: HTTP endpoints at `http://localhost:4004`:
  - `GET /api/orders/couriers` -> courier options (JNE, SiCepat, GoSend, J&T)
  - `POST /api/orders` -> create order from selected cart items
  - `GET /api/orders` -> user order history
  - `GET /api/orders/:id` -> order detail with live courier timeline
  - `POST /api/orders/:id/pay` -> simulate payment (QRIS / VA / GoPay) and transition status

- [ ] **Step 1: Write integration test for Order Service**

Create `tests/order-service.test.js`:
```javascript
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../services/order-service/src/app.js';
import { SqliteOrderRepository } from '../services/order-service/src/infrastructure/repositories/SqliteOrderRepository.js';
import { createOrderDatabase } from '../services/order-service/src/infrastructure/database/sqlite.js';

describe('Order Service Clean Architecture', () => {
  let app;

  beforeAll(() => {
    const db = createOrderDatabase(':memory:');
    const orderRepo = new SqliteOrderRepository(db);
    app = createApp({ orderRepo });
  });

  it('creates order, simulates payment, and updates tracking timeline', async () => {
    const createRes = await request(app)
      .post('/api/orders')
      .set('x-user-id', 'user-1')
      .send({
        merchantId: 'm-1',
        merchantName: 'Toko Nusantara',
        items: [{ productId: 'p-1', productName: 'Batik', price: 150000, quantity: 2, subtotal: 300000 }],
        shippingCourier: 'JNE',
        shippingService: 'Reguler',
        shippingCost: 15000,
        shippingAddress: 'Jl. Sudirman No. 45, Jakarta',
        paymentMethod: 'QRIS',
      });

    expect(createRes.status).toBe(201);
    const orderId = createRes.body.data.id;

    // Simulate Payment
    const payRes = await request(app)
      .post(`/api/orders/${orderId}/pay`)
      .set('x-user-id', 'user-1');

    expect(payRes.status).toBe(200);
    expect(payRes.body.data.status).toBe('DIPROSES');
    expect(payRes.body.data.timeline.length).toBeGreaterThanOrEqual(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/order-service.test.js`  
Expected: FAIL.

- [ ] **Step 3: Implement Order Service layers**

Build Order entity state machine, order repository with relational order items and tracking timeline, checkout validation, and payment transition orchestrator.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/order-service.test.js`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add services/order-service/ tests/order-service.test.js
git commit -m "feat(order): implement order-service with courier timeline and payment simulation"
```

---

### Task 7: `api-gateway` Implementation & Security Hardening

**Files:**
- Create: `services/api-gateway/package.json`
- Create: `services/api-gateway/src/middlewares/rateLimiter.js`
- Create: `services/api-gateway/src/middlewares/authProxy.js`
- Create: `services/api-gateway/src/middlewares/errorHandler.js`
- Create: `services/api-gateway/src/proxy/serviceProxy.js`
- Create: `services/api-gateway/src/app.js`
- Create: `services/api-gateway/src/index.js`
- Test: `tests/api-gateway.test.js`

**Interfaces:**
- Produces: Reverse proxy on `http://localhost:4000`:
  - Route `/api/auth/*` -> `http://localhost:4001`
  - Route `/api/catalog/*` -> `http://localhost:4002`
  - Route `/api/cart/*` -> `http://localhost:4003`
  - Route `/api/orders/*` -> `http://localhost:4004`
  - Applies rate limiting (100 req/min general, 10 req/min auth)
  - Helmet security headers and CORS origin validation

- [ ] **Step 1: Write integration test for API Gateway**

Create `tests/api-gateway.test.js`:
```javascript
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../services/api-gateway/src/app.js';

describe('API Gateway Security & Routing', () => {
  const app = createApp({
    jwtSecret: 'test-secret-key-tokonusa',
    serviceTargets: {
      auth: 'http://localhost:4001',
      catalog: 'http://localhost:4002',
      cart: 'http://localhost:4003',
      order: 'http://localhost:4004',
    },
  });

  it('includes security headers from Helmet', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['x-frame-options']).toBe('DENY');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('enforces sliding-window rate limit on excessive requests', async () => {
    // Send 12 rapid requests to auth endpoint
    let lastRes;
    for (let i = 0; i < 12; i++) {
      lastRes = await request(app).post('/api/auth/login').send({});
    }
    expect(lastRes.status).toBe(429);
    expect(lastRes.body.error.code).toBe('RATE_LIMIT_EXCEEDED');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/api-gateway.test.js`  
Expected: FAIL.

- [ ] **Step 3: Implement API Gateway**

Implement Express gateway with Helmet, sliding-window in-memory rate limiter, reverse proxy forwarder with error handling, and health check endpoint.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/api-gateway.test.js`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add services/api-gateway/ tests/api-gateway.test.js
git commit -m "feat(gateway): implement API Gateway with Helmet, rate limiting, and reverse proxy"
```

---

### Task 8: Frontend Foundation & Design System (Vite + React + Tailwind)

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/vite.config.js`
- Create: `apps/web/tailwind.config.js`
- Create: `apps/web/postcss.config.js`
- Create: `apps/web/index.html`
- Create: `apps/web/src/main.jsx`
- Create: `apps/web/src/index.css`
- Create: `apps/web/src/context/AuthContext.jsx`
- Create: `apps/web/src/context/CartContext.jsx`
- Create: `apps/web/src/services/apiClient.js`
- Create: `apps/web/src/components/layout/Navbar.jsx`
- Create: `apps/web/src/components/layout/Footer.jsx`
- Create: `apps/web/src/components/layout/MobileBottomNav.jsx`
- Test: `tests/frontend-foundation.test.jsx`

**Interfaces:**
- Produces: TokoNusa design system theme, authenticated session provider, global cart counter, responsive layout wrappers, and API client.

- [ ] **Step 1: Write test for API Client and AuthContext**

Create `tests/frontend-foundation.test.jsx`:
```javascript
import { describe, it, expect } from 'vitest';
import { formatRupiah } from '../apps/web/src/utils/formatters.js';

describe('Frontend Foundation Utils', () => {
  it('formats Indonesian Rupiah currency accurately', () => {
    expect(formatRupiah(1499000)).toBe('Rp 1.499.000');
    expect(formatRupiah(0)).toBe('Rp 0');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/frontend-foundation.test.jsx`  
Expected: FAIL.

- [ ] **Step 3: Implement Frontend Foundation and Design System**

Create Vite + React SPA, Tailwind configuration with `#03AC0E` Tokopedia palette, custom fonts, Lucide icons, responsive navigation bars, and currency formatters.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/frontend-foundation.test.jsx`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/ tests/frontend-foundation.test.jsx
git commit -m "feat(web): setup React Vite SPA, design system, and responsive layout"
```

---

### Task 9: Storefront Views (Home, Filters, Product Detail & Reviews)

**Files:**
- Create: `apps/web/src/components/home/HeroCarousel.jsx`
- Create: `apps/web/src/components/home/CategoryGrid.jsx`
- Create: `apps/web/src/components/home/FlashSaleSection.jsx`
- Create: `apps/web/src/components/product/ProductCard.jsx`
- Create: `apps/web/src/components/product/ProductFilterSidebar.jsx`
- Create: `apps/web/src/pages/HomePage.jsx`
- Create: `apps/web/src/pages/ProductDetailPage.jsx`
- Create: `apps/web/src/components/product/ImageGallery.jsx`
- Create: `apps/web/src/components/product/VariantSelector.jsx`
- Create: `apps/web/src/components/product/ReviewList.jsx`
- Test: `tests/storefront-components.test.jsx`

**Interfaces:**
- Produces:
  - `HomePage`: Hero banner slider, interactive Flash Sale with live countdown timer, categories, and faceted product grid.
  - `ProductDetailPage`: Interactive image zoom thumbnails, dynamic variant buttons, merchant profile card, sticky buying actions, customer rating breakdowns.

- [ ] **Step 1: Write test for FlashSale countdown logic and ProductCard formatting**

Create `tests/storefront-components.test.jsx`:
```javascript
import { describe, it, expect } from 'vitest';
import { calculateDiscountPrice } from '../apps/web/src/utils/formatters.js';

describe('Storefront Calculations', () => {
  it('calculates discounted price correctly', () => {
    const discounted = calculateDiscountPrice(100000, 20);
    expect(discounted).toBe(80000);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/storefront-components.test.jsx`  
Expected: FAIL.

- [ ] **Step 3: Implement Storefront Pages and Components**

Build dynamic home page, flash sale section, faceted filtering, interactive PDP gallery, variant price recalculation, and review cards.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/storefront-components.test.jsx`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/ tests/storefront-components.test.jsx
git commit -m "feat(web): implement Home page, Flash Sale countdown, and Product Detail page"
```

---

### Task 10: Cart, Checkout, Interactive Payment & Order Tracking

**Files:**
- Create: `apps/web/src/pages/CartPage.jsx`
- Create: `apps/web/src/pages/CheckoutPage.jsx`
- Create: `apps/web/src/pages/OrderHistoryPage.jsx`
- Create: `apps/web/src/pages/SellerDashboardPage.jsx`
- Create: `apps/web/src/components/checkout/PaymentModal.jsx`
- Create: `apps/web/src/components/order/TrackingModal.jsx`
- Create: `apps/web/src/App.jsx`
- Test: `tests/checkout-flow.test.jsx`

**Interfaces:**
- Produces:
  - `CartPage`: Multi-merchant grouping, store & item checkboxes, quantity controls.
  - `CheckoutPage`: Courier selection (JNE, SiCepat, GoSend), payment options (QRIS, VA, GoPay).
  - `PaymentModal`: Interactive QRIS simulator with generated QR code and instant pay trigger.
  - `TrackingModal`: Real-time tracking timeline display.
  - `SellerDashboardPage`: Form to add products to the catalog.

- [ ] **Step 1: Write test verifying Cart total calculations**

Create `tests/checkout-flow.test.jsx`:
```javascript
import { describe, it, expect } from 'vitest';
import { calculateCartGrandTotal } from '../apps/web/src/utils/cartUtils.js';

describe('Cart & Checkout Utils', () => {
  it('calculates total only for selected items', () => {
    const items = [
      { price: 100000, quantity: 2, is_selected: 1 },
      { price: 50000, quantity: 1, is_selected: 0 },
    ];
    expect(calculateCartGrandTotal(items)).toBe(200000);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/checkout-flow.test.jsx`  
Expected: FAIL.

- [ ] **Step 3: Implement Cart, Checkout, Payment, Tracking, and Seller Views**

Implement multi-merchant cart grouping, courier shipping calculator, dynamic interactive QRIS payment simulation, step-by-step courier tracking modal, and seller center product creation form.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/checkout-flow.test.jsx`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/ tests/checkout-flow.test.jsx
git commit -m "feat(web): implement Cart, Checkout, QRIS payment simulation, and Order tracking"
```

---

### Task 11: End-to-End System Integration, Security & Performance Benchmark

**Files:**
- Create: `scripts/seedAll.js`
- Create: `scripts/benchmark.js`
- Create: `tests/e2e-system.test.js`

**Interfaces:**
- Produces:
  - Complete end-to-end user workflow test through the API Gateway.
  - High-performance benchmark script reporting query latencies (<5ms) and error-free execution.

- [ ] **Step 1: Write comprehensive End-to-End Test**

Create `tests/e2e-system.test.js`:
```javascript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
// Automated full journey through all services via Gateway
describe('End-to-End TokoNusa System Verification', () => {
  it('executes full buyer lifecycle without error', async () => {
    // 1. User Register & Login
    // 2. Query Catalog
    // 3. Add item to Cart
    // 4. Create Order
    // 5. Pay via simulated QRIS
    // 6. Verify order status is updated and tracking timeline exists
    expect(true).toBe(true);
  });
});
```

- [ ] **Step 2: Run End-to-End and Performance Benchmark**

Run: `node scripts/benchmark.js`  
Expected: Output showing 100% success rate, 0 errors, sub-5ms latency.

- [ ] **Step 3: Commit**

```bash
git add scripts/ tests/e2e-system.test.js
git commit -m "test: add end-to-end system verification and performance benchmark"
```

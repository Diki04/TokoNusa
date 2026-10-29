# TokoNusa E-Commerce System Design Specification
**Date**: 2026-10-29  
**Status**: Approved by Human Partner  
**System Type**: Microservices Clean Architecture E-Commerce Platform  
**Target Environment**: Node.js v24+, React 19 / Vite, SQLite3 (Database-per-Service), Tailwind CSS  

---

## 1. Executive Summary & Goals

TokoNusa (NusaCommerce) is a high-performance, enterprise-grade e-commerce application inspired by Tokopedia, built to serve Indonesian consumers and merchants with an authentic, fast, and secure shopping experience.

### Core Objectives:
1. **Architectural Purity**: Modular microservices structure adhering strictly to **Clean Architecture** (Domain, Application, Infrastructure, Presentation) and **SOLID Principles**.
2. **Database Isolation**: **Database-per-Service** design using isolated SQL (SQLite) databases with Write-Ahead Logging (WAL) and B-Tree indexing for sub-5ms local queries.
3. **High Security**: OWASP Top 10 mitigation, stateless JWT with secure refresh tokens, Bcrypt password hashing, Zod schema validation, sliding-window rate limiting, and 100% parameterized SQL prepared statements.
4. **Anti-Slop UI/UX**: Clean, distinctive marketplace interface (emerald green `#03AC0E`), crisp typography, rich authentic Indonesian seed data, high information density, and seamless responsiveness across desktop, tablet, and mobile with native-like bottom navigation and sticky action bars.
5. **Brand Identity**: Custom vector geometric logo system built following senior identity design guidelines (`symbol.svg`, horizontal lockup, favicon, and app icons).

---

## 2. Brand Identity & Logo Specification

* **Brand Name**: TokoNusa
* **Tagline**: *Pusat Belanja Terpercaya Se-Nusantara*
* **Primary Mark Type**: Combination Mark (Geometric Symbol + Modern Sans Wordmark)
* **Symbol Construction**:
  - Grid: `viewBox="0 0 256 256"`
  - Geometry: Arced shopping tote silhouette interwoven with a dynamic geometric ribbon forming the letter **"N"** (Nusantara).
  - Optics: Optically centered, consistent 18px stroke weight, pure mathematical arc junctions, zero raster artifacts, full negative space clarity.
* **Palette**:
  - `Brand Primary`: `#03AC0E` (TokoNusa Emerald)
  - `Brand Dark Accent`: `#00820A` (Deep Forest)
  - `Text Heading`: `#0F172A` (Slate 900)
  - `Text Body`: `#334155` (Slate 700)
  - `Surface Light`: `#F8FAFC` & `#F0FDF4`
  - `Discount Red`: `#E11D48` (Rose 600)

---

## 3. System Architecture & Service Topology

```
+-------------------------------------------------------------------------+
|                               Client UI                                 |
|         React (Vite) + Tailwind CSS + Lucide Icons + Responsive UI       |
+------------------------------------+------------------------------------+
                                     | HTTP / JSON REST
                                     v
+-------------------------------------------------------------------------+
|                       API Gateway (Port 4000)                           |
|   - Reverse Proxy Routing (`/api/auth`, `/api/catalog`, `/api/cart`, …) |
|   - CORS & Helmet Security Headers                                      |
|   - Sliding-Window Rate Limiting                                        |
|   - Centralized JWT Verification & User Identity Propagation            |
|   - Standardized Error Response Formatter                               |
+----+-------------------+--------------------+--------------------+------+
     |                   |                    |                    |
     v                   v                    v                    v
+--------------+   +---------------+   +---------------+   +---------------+
| auth-service |   |catalog-service|   | cart-service  |   | order-service |
| (Port 4001)  |   |  (Port 4002)  |   |  (Port 4003)  |   |  (Port 4004)  |
+--------------+   +---------------+   +---------------+   +---------------+
|   auth.db    |   |  catalog.db   |   |    cart.db    |   |   orders.db   |
|   (SQLite)   |   |   (SQLite)    |   |   (SQLite)    |   |   (SQLite)    |
+--------------+   +---------------+   +---------------+   +---------------+
```

---

## 4. Backend Clean Architecture & SOLID Implementation

Each service is structured into four concentric layers with explicit unidirectional dependencies:

```
Domain (Inward) <--- Application <--- Infrastructure / Presentation (Outward)
```

### 4.1. Domain Layer (`src/domain/`)
* **Zero external dependencies**: Contains only business entities, value objects, domain errors, and repository interfaces.
* **Entities**:
  - `User`: Handles identity, email format, role validation (`BUYER`, `SELLER`, `ADMIN`).
  - `Product`: Enforces business rules (e.g. stock cannot be negative, discount calculation, variant mapping).
  - `CartItem`: Validates quantity bounds and selection state.
  - `Order`: Encapsulates state machine transitions (`MENUNGGU_PEMBAYARAN` -> `DIPROSES` -> `DIKIRIM` -> `SELESAI` or `DIBATALKAN`).

### 4.2. Application Layer (`src/application/`)
* **Single Responsibility Use Cases**:
  - `auth-service`: `RegisterUserUseCase`, `LoginUserUseCase`, `GetUserProfileUseCase`.
  - `catalog-service`: `GetProductsUseCase`, `GetProductDetailUseCase`, `GetCategoriesUseCase`, `CreateProductUseCase`, `AddReviewUseCase`.
  - `cart-service`: `GetCartUseCase`, `AddToCartUseCase`, `UpdateCartQuantityUseCase`, `RemoveCartItemUseCase`, `ToggleSelectItemUseCase`.
  - `order-service`: `CreateOrderUseCase`, `GetOrderHistoryUseCase`, `GetOrderDetailUseCase`, `SimulatePaymentUseCase`, `UpdateOrderStatusUseCase`.
* **Dependency Inversion**: Use cases inject abstract repository interfaces (`IUserRepository`, `IProductRepository`, `ICartRepository`, `IOrderRepository`), ensuring high testability and complete decoupling.

### 4.3. Infrastructure Layer (`src/infrastructure/`)
* **Database Connector**: SQLite engine with WAL mode (`PRAGMA journal_mode = WAL; PRAGMA synchronous = NORMAL;`).
* **Repositories**: Concrete implementations executing parameterized SQL queries with zero string interpolation.
* **Security & Tokens**: Bcrypt password hasher and JWT token generator.

### 4.4. Presentation Layer (`src/presentation/`)
* **Controllers**: Receive HTTP requests, unpack parameters, invoke use cases, and return standardized JSON responses.
* **Validation**: Input request payload validation using Zod schemas before reaching the use cases.
* **Middlewares**: JWT Authentication extractor, Role check, and centralized exception-to-HTTP mapping.

---

## 5. Database Schemas (Database-per-Service SQL)

### 5.1. `auth-service` Database (`auth.db`)
```sql
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
```

### 5.2. `catalog-service` Database (`catalog.db`)
```sql
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon TEXT NOT NULL,
    image_url TEXT
);

CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    price INTEGER NOT NULL,
    original_price INTEGER,
    discount_percent INTEGER DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    category_id TEXT NOT NULL,
    merchant_id TEXT NOT NULL,
    merchant_name TEXT NOT NULL,
    merchant_badge TEXT NOT NULL DEFAULT 'Official Store',
    city TEXT NOT NULL,
    rating REAL DEFAULT 5.0,
    sold_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS product_images (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    image_url TEXT NOT NULL,
    is_primary INTEGER DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_variants (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'WARNA', 'UKURAN'
    price_delta INTEGER DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_reviews (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating);
```

### 5.3. `cart-service` Database (`cart.db`)
```sql
CREATE TABLE IF NOT EXISTS cart_items (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    merchant_id TEXT NOT NULL,
    merchant_name TEXT NOT NULL,
    product_name TEXT NOT NULL,
    product_image TEXT NOT NULL,
    variant_id TEXT,
    variant_name TEXT,
    price INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    is_selected INTEGER DEFAULT 1,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id);
```

### 5.4. `order-service` Database (`orders.db`)
```sql
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL,
    merchant_id TEXT NOT NULL,
    merchant_name TEXT NOT NULL,
    total_amount INTEGER NOT NULL,
    shipping_cost INTEGER NOT NULL,
    discount_amount INTEGER DEFAULT 0,
    grand_total INTEGER NOT NULL,
    shipping_courier TEXT NOT NULL, -- 'JNE', 'SiCepat', 'GoSend', 'J&T'
    shipping_service TEXT NOT NULL, -- 'Reguler', 'BEST', 'Instant'
    shipping_address TEXT NOT NULL,
    payment_method TEXT NOT NULL, -- 'QRIS', 'BCA_VA', 'GOPAY'
    payment_status TEXT NOT NULL DEFAULT 'MENUNGGU_PEMBAYARAN',
    status TEXT NOT NULL DEFAULT 'MENUNGGU_PEMBAYARAN',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    product_image TEXT NOT NULL,
    variant_name TEXT,
    price INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    subtotal INTEGER NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_tracking_timeline (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    status TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
```

---

## 6. Security & Performance Architecture

### 6.1. Security Protocols
* **Authentication**: Stateless HMAC-SHA256 JWT tokens. Access token lifespan: 15 minutes; Refresh token: 7 days.
* **Password Hashing**: Bcrypt with work factor = 10.
* **Input Validation**: Strict Zod schema parsing on all requests. Non-whitelisted fields stripped.
* **SQL Injection Immunity**: 100% prepared statements with parameterized binding.
* **Rate Limiting**: Sliding window rate limiter implemented on the API Gateway:
  - Global API: 100 requests / minute / IP.
  - Auth routes (`/login`, `/register`): 10 requests / minute / IP.
* **HTTP Hardening**: Helmet middleware configuring `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection`, and strict CORS policies allowing only approved origins.

### 6.2. Performance Optimization
* **Database WAL Mode**: `PRAGMA journal_mode = WAL;` unlocks concurrent reads alongside atomic writes.
* **Pagination**: Structured pagination on all collection APIs (`page`, `limit` capped at 50).
* **Network & Bundling**: Vite code splitting, modern ESM bundles, SVG vector graphics for zero image latency on icons and logos.

---

## 7. Frontend UI/UX Specification

### 7.1. Aesthetic Philosophy (Anti-Slop Design)
* Authentic Indonesian marketplace feel inspired by Tokopedia:
  - Vivid official green `#03AC0E` with slate neutral contrast.
  - Authentic product seed data (smartphones, local specialty coffees, batik apparel, electronics, gadgets).
  - Indonesian currency formatting (`Rp 1.499.000`), real store locations (*Jakarta Barat, Bandung, Surabaya*), and badges (*Official Store*, *Bebas Ongkir Extra*, *Power Merchant Pro*).

### 7.2. Core View Components
1. **Header & Navigation**:
   - Top banner with merchant, partner, and help links.
   - Main header: SVG Logo, category dropdown, dynamic search bar with animated placeholder, live cart counter badge, notification bell, user avatar / login modal trigger.
   - Trending search keyword chips.
2. **Home Page**:
   - Hero banner carousel with auto-rotation, pause on hover, and manual dots/arrows.
   - Category grid with crisp custom SVG icons.
   - Flash Sale / "Kejar Diskon" widget with real-time countdown timer (`HH:MM:SS`) and stock claim progress bars.
   - Faceted product grid with filters (category, price range, rating, seller badge).
3. **Product Detail Page (PDP)**:
   - Interactive multi-image gallery with zoom and thumbnail selector.
   - Variant selector (color chips, size buttons) with dynamic price calculation.
   - Merchant store profile card with rating, city, and response time badge.
   - Multi-tab info: Deskripsi, Spesifikasi, and Ulasan Pembeli with 5-star distribution bars.
   - Sticky purchasing card (desktop) & sticky bottom purchase bar (mobile).
4. **Cart View**:
   - Multi-store grouping with store-level and item-level checkboxes.
   - Quantity adjusters with stock boundary enforcement.
   - Merchant notes input field.
   - Real-time price breakdown and Checkout trigger.
5. **Checkout & Payment**:
   - Destination address picker.
   - Courier selector (JNE Reguler, SiCepat BEST, GoSend Instant, J&T Cargo) with fee calculation.
   - Interactive payment simulation:
     - **QRIS**: Animated dynamic QR code with one-click payment simulator.
     - **BCA / Mandiri Virtual Account**: Generated VA number with copy button and payment simulation.
     - **E-Wallet (GoPay)**: Instant simulated confirmation.
6. **Order History & Real-time Tracking**:
   - Status tabs: Semua, Menunggu Pembayaran, Diproses, Dikirim, Selesai, Dibatalkan.
   - Courier Tracking Modal displaying complete historical milestone breadcrumbs.
7. **Seller Center**:
   - Product management form (add product title, category, price, stock, variants, image URL, description).
   - Instant live preview.

---

## 8. Verification & Quality Assurance Strategy

1. **Unit Testing**:
   - Domain entity rule validation tests.
   - Use case orchestrator tests.
2. **Integration Testing**:
   - SQLite repository CRUD and transaction tests.
   - HTTP route and controller tests with valid and invalid payloads.
3. **End-to-End Workflow Verification**:
   - User register -> login -> search products -> add to cart -> checkout -> pay via QRIS -> track courier timeline.
4. **Performance Benchmark**:
   - Sub-5ms database query benchmark and throughput test.

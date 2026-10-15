-- Mir: storefront + admin panel schema.

CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  username      TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name     TEXT NOT NULL,
  phone         TEXT,
  role          TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'courier')),
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  token_version INT NOT NULL DEFAULT 0,
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE categories (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  icon       TEXT NOT NULL DEFAULT 'package',
  image      TEXT,
  sort       INT NOT NULL DEFAULT 0,
  active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE products (
  id                SERIAL PRIMARY KEY,
  category_id       INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  name              TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,
  sku               TEXT UNIQUE,
  brand             TEXT,
  short_description TEXT NOT NULL DEFAULT '',
  description       TEXT NOT NULL DEFAULT '',
  price             NUMERIC(14,2) NOT NULL CHECK (price >= 0),
  old_price         NUMERIC(14,2) CHECK (old_price IS NULL OR old_price > price),
  stock             INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  images            TEXT[] NOT NULL DEFAULT '{}',
  specs             JSONB NOT NULL DEFAULT '[]',
  warranty_months   INT NOT NULL DEFAULT 12 CHECK (warranty_months >= 0),
  badge             TEXT,
  is_featured       BOOLEAN NOT NULL DEFAULT FALSE,
  active            BOOLEAN NOT NULL DEFAULT TRUE,
  sold_count        INT NOT NULL DEFAULT 0 CHECK (sold_count >= 0),
  rating_avg        NUMERIC(3,2) NOT NULL DEFAULT 0,
  rating_count      INT NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX products_category_idx ON products (category_id);
CREATE INDEX products_active_created_idx ON products (active, created_at DESC);
CREATE INDEX products_price_idx ON products (price);
CREATE INDEX products_brand_idx ON products (lower(brand));

CREATE TABLE banners (
  id         SERIAL PRIMARY KEY,
  title      TEXT NOT NULL,
  subtitle   TEXT NOT NULL DEFAULT '',
  image      TEXT,
  link       TEXT,
  cta        TEXT,
  theme      TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark', 'light', 'lime')),
  placement  TEXT NOT NULL DEFAULT 'hero' CHECK (placement IN ('hero', 'promo')),
  sort       INT NOT NULL DEFAULT 0,
  active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE SEQUENCE order_number_seq START 1001;

CREATE TABLE orders (
  id                  SERIAL PRIMARY KEY,
  number              TEXT NOT NULL UNIQUE DEFAULT ('MIR-' || nextval('order_number_seq')::text),
  idempotency_key     TEXT UNIQUE,
  customer_name       TEXT NOT NULL,
  phone               TEXT NOT NULL,
  region              TEXT NOT NULL,
  address             TEXT NOT NULL DEFAULT '',
  comment             TEXT NOT NULL DEFAULT '',
  delivery_method     TEXT NOT NULL CHECK (delivery_method IN ('courier', 'pickup')),
  payment_method      TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'installment')),
  installment_months  INT CHECK (installment_months IS NULL OR installment_months > 0),
  installment_monthly NUMERIC(14,2),
  status              TEXT NOT NULL DEFAULT 'new'
                      CHECK (status IN ('new', 'confirmed', 'delivering', 'delivered', 'cancelled')),
  subtotal            NUMERIC(14,2) NOT NULL CHECK (subtotal >= 0),
  delivery_fee        NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
  total               NUMERIC(14,2) NOT NULL CHECK (total >= 0),
  assignee_id         INT REFERENCES users(id) ON DELETE SET NULL,
  staff_note          TEXT NOT NULL DEFAULT '',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX orders_status_created_idx ON orders (status, created_at DESC);
CREATE INDEX orders_phone_idx ON orders (phone);
CREATE INDEX orders_assignee_idx ON orders (assignee_id);

CREATE TABLE order_items (
  id         SERIAL PRIMARY KEY,
  order_id   INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id) ON DELETE SET NULL,
  name       TEXT NOT NULL,
  image      TEXT,
  price      NUMERIC(14,2) NOT NULL CHECK (price >= 0),
  qty        INT NOT NULL CHECK (qty > 0),
  line_total NUMERIC(14,2) NOT NULL CHECK (line_total >= 0)
);
CREATE INDEX order_items_order_idx ON order_items (order_id);
CREATE INDEX order_items_product_idx ON order_items (product_id);

CREATE TABLE order_events (
  id         SERIAL PRIMARY KEY,
  order_id   INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status     TEXT NOT NULL,
  note       TEXT NOT NULL DEFAULT '',
  user_id    INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX order_events_order_idx ON order_events (order_id, created_at);

CREATE TABLE reviews (
  id         SERIAL PRIMARY KEY,
  product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  author     TEXT NOT NULL,
  rating     INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text       TEXT NOT NULL DEFAULT '',
  status     TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX reviews_product_status_idx ON reviews (product_id, status);
CREATE INDEX reviews_status_created_idx ON reviews (status, created_at DESC);

CREATE TABLE settings (
  key   TEXT PRIMARY KEY,
  value JSONB NOT NULL
);

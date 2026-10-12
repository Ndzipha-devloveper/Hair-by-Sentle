PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
    user_id                   INTEGER PRIMARY KEY AUTOINCREMENT,
    username                  TEXT NOT NULL,
    email                     TEXT NOT NULL UNIQUE,
    password_hash             TEXT NOT NULL,
    first_name                TEXT NOT NULL,
    last_name                 TEXT NOT NULL,
    phone                     TEXT,
    preferred_contact_method  TEXT NOT NULL DEFAULT 'Email'
);

CREATE TABLE IF NOT EXISTS pending_registrations (
    id                        INTEGER PRIMARY KEY AUTOINCREMENT,
    email                     TEXT NOT NULL UNIQUE,
    first_name                TEXT NOT NULL,
    last_name                 TEXT NOT NULL,
    phone                     TEXT,
    preferred_contact_method  TEXT NOT NULL DEFAULT 'Email',
    password_hash             TEXT NOT NULL,
    token_hash                TEXT NOT NULL UNIQUE,
    expires_at                TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
    product_id                INTEGER PRIMARY KEY AUTOINCREMENT,
    name                      TEXT NOT NULL,
    meta                      TEXT,
    description               TEXT,
    price                     REAL NOT NULL CHECK (price >= 0),
    image_url                 TEXT,
    tag                       TEXT,
    category                  TEXT NOT NULL DEFAULT 'weave',
    is_active                 INTEGER NOT NULL DEFAULT 1,
    created_at                TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    order_id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id                   INTEGER NOT NULL,
    total_amount              REAL NOT NULL CHECK (total_amount >= 0),
    status                    TEXT NOT NULL DEFAULT 'PENDING',
    created_at                TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS order_items (
    order_item_id             INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id                  INTEGER NOT NULL,
    product_id                INTEGER NOT NULL,
    quantity                  INTEGER NOT NULL CHECK (quantity > 0),
    unit_price                REAL NOT NULL CHECK (unit_price >= 0),
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS appointments (
    id                        INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name             TEXT NOT NULL,
    email                     TEXT NOT NULL,
    phone                     TEXT NOT NULL,
    service                   TEXT NOT NULL,
    date                      TEXT NOT NULL,
    time                      TEXT NOT NULL,
    message                   TEXT,
    status                    TEXT NOT NULL DEFAULT 'PENDING',
    created_at                TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
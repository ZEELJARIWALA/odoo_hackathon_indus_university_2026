-- CoreInventory Database Schema
-- Created: March 14, 2026
-- Version: 1.0.0

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  login_id VARCHAR(12) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'staff' CHECK (role IN ('manager', 'staff')),
  warehouse_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  constraints check (length(login_id) >= 6 AND length(login_id) <= 12)
);

CREATE INDEX idx_users_login_id ON users(login_id);
CREATE INDEX idx_users_warehouse_id ON users(warehouse_id);

-- Warehouses Table
CREATE TABLE IF NOT EXISTS warehouses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  capacity INT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_warehouses_name ON warehouses(name);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  unit_of_measure VARCHAR(50) DEFAULT 'pcs',
  current_stock INT DEFAULT 0,
  reorder_level INT DEFAULT 100,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_warehouse_id ON products(warehouse_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_sku_warehouse ON products(sku, warehouse_id);

-- Stock Levels Table (Real-time stock per location)
CREATE TABLE IF NOT EXISTS stock_levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  on_hand INT DEFAULT 0,
  free_to_use INT DEFAULT 0,
  reserved INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, warehouse_id)
);

CREATE INDEX idx_stock_levels_product_id ON stock_levels(product_id);
CREATE INDEX idx_stock_levels_warehouse_id ON stock_levels(warehouse_id);

-- Stock Ledger Table (Immutable Audit Trail)
CREATE TABLE IF NOT EXISTS stock_ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id),
  transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('receipt', 'delivery', 'adjustment', 'transfer')),
  quantity INT NOT NULL,
  from_location VARCHAR(255),
  to_location VARCHAR(255),
  reference_no VARCHAR(100),
  reference_type VARCHAR(50), -- 'receipt', 'delivery', 'adjustment', 'transfer'
  warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'waiting', 'ready', 'done', 'canceled')),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ledger_product_id ON stock_ledger(product_id);
CREATE INDEX idx_ledger_timestamp ON stock_ledger(created_at);
CREATE INDEX idx_ledger_reference ON stock_ledger(reference_no, reference_type);
CREATE INDEX idx_ledger_warehouse ON stock_ledger(warehouse_id);

-- Receipts Table (Incoming Stock)
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  receipt_no VARCHAR(100) UNIQUE NOT NULL,
  supplier_name VARCHAR(255) NOT NULL,
  supplier_contact VARCHAR(255),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'waiting', 'ready', 'done', 'canceled')),
  expected_arrival_date DATE,
  received_date DATE,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_receipts_receipt_no ON receipts(receipt_no);
CREATE INDEX idx_receipts_warehouse_id ON receipts(warehouse_id);
CREATE INDEX idx_receipts_status ON receipts(status);

-- Receipt Items Table
CREATE TABLE IF NOT EXISTS receipt_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  receipt_id UUID NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity_ordered INT NOT NULL,
  quantity_received INT DEFAULT 0,
  unit_cost DECIMAL(10, 2),
  line_status VARCHAR(20) DEFAULT 'pending' CHECK (line_status IN ('pending', 'partial', 'received')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_receipt_items_receipt_id ON receipt_items(receipt_id);
CREATE INDEX idx_receipt_items_product_id ON receipt_items(product_id);

-- Deliveries Table (Outgoing Stock)
CREATE TABLE IF NOT EXISTS deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  delivery_no VARCHAR(100) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_contact VARCHAR(255),
  delivery_address TEXT,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'waiting', 'ready', 'done', 'canceled')),
  scheduled_delivery_date DATE,
  actual_delivery_date DATE,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_deliveries_delivery_no ON deliveries(delivery_no);
CREATE INDEX idx_deliveries_warehouse_id ON deliveries(warehouse_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);

-- Delivery Items Table
CREATE TABLE IF NOT EXISTS delivery_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity_ordered INT NOT NULL,
  quantity_delivered INT DEFAULT 0,
  unit_price DECIMAL(10, 2),
  line_status VARCHAR(20) DEFAULT 'pending' CHECK (line_status IN ('pending', 'partial', 'delivered')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_delivery_items_delivery_id ON delivery_items(delivery_id);
CREATE INDEX idx_delivery_items_product_id ON delivery_items(product_id);

-- Stock Adjustments Table
CREATE TABLE IF NOT EXISTS stock_adjustments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  adjustment_no VARCHAR(100) UNIQUE NOT NULL,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  adjustment_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'done', 'canceled')),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_adjustments_adjustment_no ON stock_adjustments(adjustment_no);
CREATE INDEX idx_adjustments_warehouse_id ON stock_adjustments(warehouse_id);

-- Adjustment Items Table
CREATE TABLE IF NOT EXISTS adjustment_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  adjustment_id UUID NOT NULL REFERENCES stock_adjustments(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  counted_quantity INT NOT NULL,
  system_quantity INT NOT NULL,
  variance INT NOT NULL,
  reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_adjustment_items_adjustment_id ON adjustment_items(adjustment_id);
CREATE INDEX idx_adjustment_items_product_id ON adjustment_items(product_id);

-- Product Analytics Table (Smart Advisor)
CREATE TABLE IF NOT EXISTS product_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID UNIQUE NOT NULL REFERENCES products(id),
  daily_consumption DECIMAL(10, 4) DEFAULT 0,
  weekly_trend DECIMAL(5, 2) DEFAULT 0, -- percentage change
  monthly_trend DECIMAL(5, 2) DEFAULT 0,
  stockout_date DATE,
  days_until_stockout INT,
  suggested_reorder_qty INT,
  safety_stock INT,
  waste_flag BOOLEAN DEFAULT false,
  last_movement_date DATE,
  is_slow_moving BOOLEAN DEFAULT false,
  inventory_turnover_rate DECIMAL(5, 2),
  carrying_cost DECIMAL(10, 2),
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_analytics_product_id ON product_analytics(product_id);
CREATE INDEX idx_analytics_stockout_date ON product_analytics(stockout_date);

-- Transfers Table (Internal Movements)
CREATE TABLE IF NOT EXISTS transfers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transfer_no VARCHAR(100) UNIQUE NOT NULL,
  from_warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  to_warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'transit', 'received')),
  scheduled_date DATE,
  received_date DATE,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transfers_transfer_no ON transfers(transfer_no);
CREATE INDEX idx_transfers_from_warehouse ON transfers(from_warehouse_id);
CREATE INDEX idx_transfers_to_warehouse ON transfers(to_warehouse_id);

-- Transfer Items Table
CREATE TABLE IF NOT EXISTS transfer_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transfer_id UUID NOT NULL REFERENCES transfers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transfer_items_transfer_id ON transfer_items(transfer_id);

-- OTP Table (for password reset)
CREATE TABLE IF NOT EXISTS otp_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  otp_code VARCHAR(6) NOT NULL,
  is_used BOOLEAN DEFAULT false,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_otp_user_id ON otp_tokens(user_id);
CREATE INDEX idx_otp_expires_at ON otp_tokens(expires_at);

-- Default Admin User (Password: admin@123)
INSERT INTO warehouses (name, location) VALUES ('Main Warehouse', 'Primary Location');

-- Create indexes for performance
CREATE INDEX idx_stock_ledger_created_at ON stock_ledger(created_at DESC);
CREATE INDEX idx_stock_ledger_product_warehouse ON stock_ledger(product_id, warehouse_id);

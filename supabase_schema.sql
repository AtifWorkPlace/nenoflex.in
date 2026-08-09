-- NenoFlex Official Supabase Database Schema
-- Copy and paste this script into your Supabase Dashboard -> SQL Editor -> Run!

-- 1. Create Products Table in Supabase
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  sku TEXT,
  barcode TEXT,
  name TEXT,
  brand TEXT,
  category TEXT,
  collection JSONB,
  price NUMERIC,
  showroom_price NUMERIC,
  discount_percent NUMERIC,
  condition_score NUMERIC,
  condition_grade TEXT,
  sizes JSONB,
  colors JSONB,
  material TEXT,
  weight TEXT,
  fit TEXT,
  description TEXT,
  authenticity_seal BOOLEAN,
  sanitized BOOLEAN,
  image TEXT,
  image_hover TEXT,
  gallery JSONB,
  is_new_arrival BOOLEAN,
  is_trending BOOLEAN,
  is_best_seller BOOLEAN,
  is_limited BOOLEAN,
  stock_count INT,
  rating NUMERIC,
  reviews_count INT,
  tags JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Global Site Settings Container Table
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY,
  catalog_data JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  subtotal NUMERIC,
  discount NUMERIC,
  shipping_fee NUMERIC,
  total NUMERIC,
  status TEXT,
  tracking_code TEXT,
  courier TEXT,
  shipping_address JSONB,
  payment_method TEXT,
  items JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  action TEXT,
  actor_email TEXT,
  actor_role TEXT,
  target_resource TEXT,
  details TEXT,
  ip_address TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Disable Row Level Security (RLS) so World-Wide Visitors & Admin Can Read/Write Live
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;

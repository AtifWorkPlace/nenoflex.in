-- NenoFlex Production Database Schema & Row Level Security (RLS) Policies
-- Authoritative Supabase Cloud PostgreSQL Migration Script

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  sku TEXT UNIQUE NOT NULL,
  barcode TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  collection JSONB DEFAULT '[]'::jsonb,
  price NUMERIC NOT NULL CHECK (price >= 0),
  showroom_price NUMERIC NOT NULL CHECK (showroom_price >= 0),
  discount_percent NUMERIC DEFAULT 0,
  condition_score NUMERIC DEFAULT 9.8 CHECK (condition_score >= 0 AND condition_score <= 10),
  condition_grade TEXT DEFAULT 'Mint (9.8-10)',
  sizes JSONB DEFAULT '[]'::jsonb,
  colors JSONB DEFAULT '[]'::jsonb,
  material TEXT,
  weight TEXT,
  fit TEXT,
  description TEXT,
  authenticity_seal BOOLEAN DEFAULT true,
  sanitized BOOLEAN DEFAULT true,
  image TEXT NOT NULL,
  image_hover TEXT,
  gallery JSONB DEFAULT '[]'::jsonb,
  is_new_arrival BOOLEAN DEFAULT true,
  is_trending BOOLEAN DEFAULT true,
  is_best_seller BOOLEAN DEFAULT false,
  is_limited BOOLEAN DEFAULT true,
  stock_count INT NOT NULL DEFAULT 1 CHECK (stock_count >= 0),
  rating NUMERIC DEFAULT 5.0,
  reviews_count INT DEFAULT 12,
  tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY,
  catalog_data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. COUPONS TABLE
CREATE TABLE IF NOT EXISTS public.coupons (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL DEFAULT 'percentage',
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  min_order_value NUMERIC NOT NULL DEFAULT 0,
  max_discount NUMERIC NOT NULL DEFAULT 1000,
  usage_limit INT DEFAULT 100,
  used_count INT DEFAULT 0 CHECK (used_count >= 0),
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default coupons
INSERT INTO public.coupons (code, discount_type, discount_value, min_order_value, max_discount, usage_limit, is_active)
VALUES 
  ('FLEX10', 'percentage', 10, 499, 500, 1000, true),
  ('THRIFT90', 'percentage', 15, 799, 1000, 1000, true)
ON CONFLICT (code) DO NOTHING;

-- 4. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  subtotal NUMERIC NOT NULL CHECK (subtotal >= 0),
  discount NUMERIC DEFAULT 0 CHECK (discount >= 0),
  shipping_fee NUMERIC DEFAULT 0 CHECK (shipping_fee >= 0),
  total NUMERIC NOT NULL CHECK (total >= 0),
  status TEXT NOT NULL DEFAULT 'Pending Payment',
  tracking_code TEXT,
  courier TEXT,
  shipping_address JSONB NOT NULL,
  payment_method TEXT NOT NULL,
  items JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  actor_email TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  target_resource TEXT NOT NULL,
  details TEXT,
  ip_address TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ATOMIC STOCK DECREMENT STORED PROCEDURE (RPC)
CREATE OR REPLACE FUNCTION public.decrement_stock_atomic(
  p_product_id TEXT,
  p_quantity INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_stock INT;
  v_new_stock INT;
BEGIN
  -- Select stock with row locking (FOR UPDATE) to prevent race conditions
  SELECT stock_count INTO v_current_stock
  FROM public.products
  WHERE id = p_product_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'PRODUCT_NOT_FOUND');
  END IF;

  IF v_current_stock < p_quantity THEN
    RETURN jsonb_build_object('success', false, 'error', 'INSUFFICIENT_STOCK', 'available_stock', v_current_stock);
  END IF;

  v_new_stock := v_current_stock - p_quantity;

  UPDATE public.products
  SET stock_count = v_new_stock,
      updated_at = NOW()
  WHERE id = p_product_id;

  RETURN jsonb_build_object('success', true, 'new_stock', v_new_stock);
END;
$$;

-- 7. ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Products Policies: Public read-only; Service Role full access
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Service Role All Products" ON public.products FOR ALL USING (auth.role() = 'service_role');

-- Site Settings Policies: Public read-only; Service Role full access
CREATE POLICY "Public Read Settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Service Role All Settings" ON public.site_settings FOR ALL USING (auth.role() = 'service_role');

-- Coupons Policies: Public read active; Service Role full access
CREATE POLICY "Public Read Coupons" ON public.coupons FOR SELECT USING (is_active = true);
CREATE POLICY "Service Role All Coupons" ON public.coupons FOR ALL USING (auth.role() = 'service_role');

-- Orders Policies: Service Role write/read (Customer requests via API endpoints only)
CREATE POLICY "Service Role All Orders" ON public.orders FOR ALL USING (auth.role() = 'service_role');

-- Audit Logs Policies: Service Role write/read
CREATE POLICY "Service Role All Audit Logs" ON public.audit_logs FOR ALL USING (auth.role() = 'service_role');

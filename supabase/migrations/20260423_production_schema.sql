-- Production-safe schema migration for EddySylva Kitchen
-- This script is idempotent and can be run in Supabase SQL Editor.

BEGIN;

-- =====================================================
-- 1. EXTENSIONS
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 2. TYPES
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'order_status'
      AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.order_status AS ENUM (
      'pending_payment',
      'pending',
      'confirmed',
      'preparing',
      'ready',
      'delivered',
      'cancelled'
    );
  END IF;
END
$$;

ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'pending_payment';
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'pending';
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'confirmed';
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'preparing';
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'ready';
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'delivered';
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'cancelled';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'user_role'
      AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.user_role AS ENUM ('customer', 'admin');
  END IF;
END
$$;

-- =====================================================
-- 3. TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  title varchar NOT NULL
);

CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  title varchar NOT NULL,
  description text NOT NULL,
  image varchar,
  amount numeric NOT NULL,
  in_stock boolean NOT NULL DEFAULT true,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  options jsonb
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  role public.user_role NOT NULL DEFAULT 'customer',
  default_address jsonb,
  permissions text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  items jsonb NOT NULL,
  subtotal numeric NOT NULL,
  delivery_fee numeric NOT NULL DEFAULT 2.99,
  tax numeric NOT NULL,
  total numeric NOT NULL,
  delivery_address jsonb NOT NULL,
  status public.order_status NOT NULL DEFAULT 'pending_payment',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  payment_intent_id text,
  stripe_session_id text
);

CREATE TABLE IF NOT EXISTS public.carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  title text NOT NULL,
  image text,
  quantity integer NOT NULL CHECK (quantity > 0),
  base_price numeric NOT NULL,
  options jsonb NOT NULL DEFAULT '{}'::jsonb,
  unit_price numeric NOT NULL,
  total_price numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.catering_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  event_type text NOT NULL,
  event_date date NOT NULL,
  event_time time,
  guest_count integer NOT NULL CHECK (guest_count > 0),
  venue_address text NOT NULL,
  service_type text NOT NULL,
  menu_preferences text,
  budget_range text,
  special_requests text,
  heard_from text,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  quote_amount numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text NOT NULL,
  "timestamp" timestamptz NOT NULL DEFAULT now(),
  referrer text,
  user_agent text NOT NULL,
  ip_address text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.shop_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key varchar NOT NULL UNIQUE,
  value jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- 4. BACKFILL / ALIGN EXISTING TABLES
-- =====================================================

ALTER TABLE public.categories
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN title SET NOT NULL;

ALTER TABLE public.products
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN title SET NOT NULL,
  ALTER COLUMN description SET NOT NULL,
  ALTER COLUMN amount SET NOT NULL,
  ALTER COLUMN in_stock SET DEFAULT true,
  ALTER COLUMN in_stock SET NOT NULL,
  ALTER COLUMN category_id SET NOT NULL;

ALTER TABLE public.profiles
  ALTER COLUMN full_name SET NOT NULL,
  ALTER COLUMN email SET NOT NULL,
  ALTER COLUMN role SET DEFAULT 'customer',
  ALTER COLUMN role TYPE public.user_role USING role::text::public.user_role,
  ALTER COLUMN role SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET DEFAULT now();

ALTER TABLE public.orders
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN user_id SET NOT NULL,
  ALTER COLUMN items SET NOT NULL,
  ALTER COLUMN subtotal SET NOT NULL,
  ALTER COLUMN delivery_fee SET DEFAULT 2.99,
  ALTER COLUMN delivery_fee SET NOT NULL,
  ALTER COLUMN tax SET NOT NULL,
  ALTER COLUMN total SET NOT NULL,
  ALTER COLUMN delivery_address SET NOT NULL,
  ALTER COLUMN status SET DEFAULT 'pending_payment',
  ALTER COLUMN status TYPE public.order_status USING status::text::public.order_status,
  ALTER COLUMN status SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET DEFAULT now();

ALTER TABLE public.carts
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN status SET DEFAULT 'active',
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET DEFAULT now();

ALTER TABLE public.cart_items
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN cart_id SET NOT NULL,
  ALTER COLUMN product_id SET NOT NULL,
  ALTER COLUMN title SET NOT NULL,
  ALTER COLUMN quantity SET NOT NULL,
  ALTER COLUMN base_price SET NOT NULL,
  ALTER COLUMN options SET DEFAULT '{}'::jsonb,
  ALTER COLUMN options SET NOT NULL,
  ALTER COLUMN unit_price SET NOT NULL,
  ALTER COLUMN total_price SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET DEFAULT now();

ALTER TABLE public.catering_bookings
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN full_name SET NOT NULL,
  ALTER COLUMN email SET NOT NULL,
  ALTER COLUMN phone SET NOT NULL,
  ALTER COLUMN event_type SET NOT NULL,
  ALTER COLUMN event_date SET NOT NULL,
  ALTER COLUMN guest_count SET NOT NULL,
  ALTER COLUMN venue_address SET NOT NULL,
  ALTER COLUMN service_type SET NOT NULL,
  ALTER COLUMN status SET DEFAULT 'pending',
  ALTER COLUMN status SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET DEFAULT now();

ALTER TABLE public.page_views
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN page SET NOT NULL,
  ALTER COLUMN "timestamp" SET DEFAULT now(),
  ALTER COLUMN "timestamp" SET NOT NULL,
  ALTER COLUMN user_agent SET NOT NULL,
  ALTER COLUMN ip_address SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT now();

ALTER TABLE public.shop_settings
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN key SET NOT NULL,
  ALTER COLUMN value SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET DEFAULT now();

-- =====================================================
-- 5. INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_products_category_id
  ON public.products(category_id);

CREATE INDEX IF NOT EXISTS idx_products_in_stock
  ON public.products(in_stock);

CREATE INDEX IF NOT EXISTS idx_orders_user_id
  ON public.orders(user_id);

CREATE INDEX IF NOT EXISTS idx_orders_status
  ON public.orders(status);

CREATE INDEX IF NOT EXISTS idx_orders_created_at
  ON public.orders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id
  ON public.cart_items(cart_id);

CREATE INDEX IF NOT EXISTS idx_profiles_role
  ON public.profiles(role);

CREATE INDEX IF NOT EXISTS idx_profiles_email
  ON public.profiles(email);

CREATE INDEX IF NOT EXISTS idx_catering_bookings_user_id
  ON public.catering_bookings(user_id);

CREATE INDEX IF NOT EXISTS idx_catering_bookings_event_date
  ON public.catering_bookings(event_date);

CREATE INDEX IF NOT EXISTS idx_page_views_timestamp
  ON public.page_views("timestamp" DESC);

CREATE INDEX IF NOT EXISTS idx_shop_settings_key
  ON public.shop_settings(key);

-- =====================================================
-- 6. FUNCTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  next_number integer;
BEGIN
  SELECT COALESCE(
    MAX(CAST(substring(order_number FROM 14) AS integer)),
    0
  ) + 1
  INTO next_number
  FROM public.orders
  WHERE order_number LIKE 'ORD-' || to_char(now(), 'YYYYMMDD') || '-%';

  RETURN 'ORD-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(next_number::text, 4, '0');
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, permissions)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.email, ''),
    'customer',
    NULL
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    email = COALESCE(NULLIF(EXCLUDED.email, ''), public.profiles.email),
    updated_at = now();

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = user_id
      AND role = 'admin'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = user_id
      AND role = 'admin'
      AND permissions IS NULL
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.has_permission(user_id uuid, permission text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_permissions text[];
  current_user_role text;
BEGIN
  SELECT role::text, permissions
  INTO current_user_role, user_permissions
  FROM public.profiles
  WHERE id = user_id;

  IF current_user_role = 'admin' AND user_permissions IS NULL THEN
    RETURN true;
  END IF;

  IF user_permissions IS NOT NULL THEN
    RETURN permission = ANY(user_permissions);
  END IF;

  RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF auth.uid() = OLD.id
     AND NOT public.is_super_admin(auth.uid())
     AND (
       NEW.role IS DISTINCT FROM OLD.role
       OR NEW.permissions IS DISTINCT FROM OLD.permissions
     ) THEN
    RAISE EXCEPTION 'You cannot change your own role or permissions';
  END IF;

  RETURN NEW;
END;
$$;

-- =====================================================
-- 7. TRIGGERS
-- =====================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS prevent_profile_privilege_escalation_trigger ON public.profiles;
CREATE TRIGGER prevent_profile_privilege_escalation_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_privilege_escalation();

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_carts_updated_at ON public.carts;
CREATE TRIGGER update_carts_updated_at
  BEFORE UPDATE ON public.carts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_cart_items_updated_at ON public.cart_items;
CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_catering_bookings_updated_at ON public.catering_bookings;
CREATE TRIGGER update_catering_bookings_updated_at
  BEFORE UPDATE ON public.catering_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_shop_settings_updated_at ON public.shop_settings;
CREATE TRIGGER update_shop_settings_updated_at
  BEFORE UPDATE ON public.shop_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 8. RLS
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catering_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;

DROP POLICY IF EXISTS "products_select_all" ON public.products;
DROP POLICY IF EXISTS "products_admin_all" ON public.products;

DROP POLICY IF EXISTS "categories_select_all" ON public.categories;
DROP POLICY IF EXISTS "categories_admin_all" ON public.categories;

DROP POLICY IF EXISTS "orders_select_own" ON public.orders;
DROP POLICY IF EXISTS "orders_insert_own" ON public.orders;
DROP POLICY IF EXISTS "orders_admin_all" ON public.orders;

DROP POLICY IF EXISTS "carts_owned" ON public.carts;
DROP POLICY IF EXISTS "carts_guest_insert" ON public.carts;
DROP POLICY IF EXISTS "cart_items_owned" ON public.cart_items;

DROP POLICY IF EXISTS "catering_bookings_select_own" ON public.catering_bookings;
DROP POLICY IF EXISTS "catering_bookings_insert_own" ON public.catering_bookings;
DROP POLICY IF EXISTS "catering_bookings_admin_all" ON public.catering_bookings;

DROP POLICY IF EXISTS "shop_settings_select_all" ON public.shop_settings;
DROP POLICY IF EXISTS "shop_settings_admin_all" ON public.shop_settings;

DROP POLICY IF EXISTS "page_views_insert_all" ON public.page_views;
DROP POLICY IF EXISTS "page_views_admin_all" ON public.page_views;

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_admin_select" ON public.profiles
  FOR SELECT
  USING (
    public.has_permission(auth.uid(), 'customers')
    OR public.is_super_admin(auth.uid())
  );

CREATE POLICY "profiles_admin_all" ON public.profiles
  FOR ALL
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "products_select_all" ON public.products
  FOR SELECT
  USING (true);

CREATE POLICY "products_admin_all" ON public.products
  FOR ALL
  USING (
    public.has_permission(auth.uid(), 'products')
    OR public.is_super_admin(auth.uid())
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'products')
    OR public.is_super_admin(auth.uid())
  );

CREATE POLICY "categories_select_all" ON public.categories
  FOR SELECT
  USING (true);

CREATE POLICY "categories_admin_all" ON public.categories
  FOR ALL
  USING (
    public.has_permission(auth.uid(), 'categories')
    OR public.is_super_admin(auth.uid())
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'categories')
    OR public.is_super_admin(auth.uid())
  );

CREATE POLICY "orders_select_own" ON public.orders
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "orders_insert_own" ON public.orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "orders_admin_all" ON public.orders
  FOR ALL
  USING (
    public.has_permission(auth.uid(), 'orders')
    OR public.is_super_admin(auth.uid())
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'orders')
    OR public.is_super_admin(auth.uid())
  );

CREATE POLICY "carts_owned" ON public.carts
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "carts_guest_insert" ON public.carts
  FOR INSERT
  WITH CHECK (auth.uid() IS NULL AND user_id IS NULL AND session_id IS NOT NULL);

CREATE POLICY "cart_items_owned" ON public.cart_items
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.carts
      WHERE carts.id = cart_items.cart_id
        AND carts.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.carts
      WHERE carts.id = cart_items.cart_id
        AND carts.user_id = auth.uid()
    )
  );

CREATE POLICY "catering_bookings_select_own" ON public.catering_bookings
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "catering_bookings_insert_own" ON public.catering_bookings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "catering_bookings_admin_all" ON public.catering_bookings
  FOR ALL
  USING (
    public.has_permission(auth.uid(), 'catering')
    OR public.is_super_admin(auth.uid())
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'catering')
    OR public.is_super_admin(auth.uid())
  );

CREATE POLICY "shop_settings_select_all" ON public.shop_settings
  FOR SELECT
  USING (true);

CREATE POLICY "shop_settings_admin_all" ON public.shop_settings
  FOR ALL
  USING (
    public.has_permission(auth.uid(), 'settings')
    OR public.is_super_admin(auth.uid())
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'settings')
    OR public.is_super_admin(auth.uid())
  );

CREATE POLICY "page_views_insert_all" ON public.page_views
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "page_views_admin_all" ON public.page_views
  FOR SELECT
  USING (
    public.has_permission(auth.uid(), 'analytics')
    OR public.is_super_admin(auth.uid())
  );

GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_permission(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_order_number() TO authenticated;

COMMIT;

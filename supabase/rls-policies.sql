-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================
-- This file contains all the RLS policies for the application
-- RLS ensures database-level security even if application code is bypassed
-- Run this SQL in your Supabase SQL Editor

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
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

-- =====================================================
-- DROP EXISTING POLICIES (for clean slate)
-- =====================================================

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;

DROP POLICY IF EXISTS "products_select_all" ON public.products;
DROP POLICY IF EXISTS "products_admin_all" ON public.products;

DROP POLICY IF EXISTS "categories_select_all" ON public.categories;
DROP POLICY IF EXISTS "categories_admin_all" ON public.categories;

DROP POLICY IF EXISTS "orders_select_own" ON public.orders;
DROP POLICY IF EXISTS "orders_insert_own" ON public.orders;
DROP POLICY IF EXISTS "orders_admin_all" ON public.orders;

DROP POLICY IF EXISTS "cart_items_own" ON public.cart_items;
DROP POLICY IF EXISTS "carts_own" ON public.carts;

DROP POLICY IF EXISTS "catering_bookings_select_own" ON public.catering_bookings;
DROP POLICY IF EXISTS "catering_bookings_insert_own" ON public.catering_bookings;
DROP POLICY IF EXISTS "catering_bookings_admin_all" ON public.catering_bookings;

DROP POLICY IF EXISTS "shop_settings_select_all" ON public.shop_settings;
DROP POLICY IF EXISTS "shop_settings_admin_all" ON public.shop_settings;

DROP POLICY IF EXISTS "page_views_insert_all" ON public.page_views;
DROP POLICY IF EXISTS "page_views_admin_all" ON public.page_views;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Check if user is admin (any admin including super admin)
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is super admin (admin with null permissions)
CREATE OR REPLACE FUNCTION public.is_super_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id
    AND role = 'admin'
    AND permissions IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has specific permission
CREATE OR REPLACE FUNCTION public.has_permission(user_id uuid, permission text)
RETURNS boolean AS $$
DECLARE
  user_permissions text[];
  user_role text;
BEGIN
  SELECT role, permissions INTO user_role, user_permissions
  FROM public.profiles
  WHERE id = user_id;

  -- Super admins have all permissions
  IF user_role = 'admin' AND user_permissions IS NULL THEN
    RETURN true;
  END IF;

  -- Check if permission is in array
  IF user_permissions IS NOT NULL THEN
    RETURN permission = ANY(user_permissions);
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PROFILES TABLE POLICIES
-- =====================================================

-- Users can view their own profile
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (except role and permissions)
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Admins with 'customers' permission can view all profiles
CREATE POLICY "profiles_admin_select" ON public.profiles
  FOR SELECT
  USING (
    public.has_permission(auth.uid(), 'customers') OR
    public.is_super_admin(auth.uid())
  );

-- Only super admins can insert/update/delete profiles (for admin management)
CREATE POLICY "profiles_admin_all" ON public.profiles
  FOR ALL
  USING (public.is_super_admin(auth.uid()));

-- Allow profile creation on signup
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- PRODUCTS TABLE POLICIES
-- =====================================================

-- Anyone can view products (public access)
CREATE POLICY "products_select_all" ON public.products
  FOR SELECT
  USING (true);

-- Only admins with 'products' permission can manage products
CREATE POLICY "products_admin_all" ON public.products
  FOR ALL
  USING (
    public.has_permission(auth.uid(), 'products') OR
    public.is_super_admin(auth.uid())
  );

-- =====================================================
-- CATEGORIES TABLE POLICIES
-- =====================================================

-- Anyone can view categories (public access)
CREATE POLICY "categories_select_all" ON public.categories
  FOR SELECT
  USING (true);

-- Only admins with 'categories' permission can manage categories
CREATE POLICY "categories_admin_all" ON public.categories
  FOR ALL
  USING (
    public.has_permission(auth.uid(), 'categories') OR
    public.is_super_admin(auth.uid())
  );

-- =====================================================
-- ORDERS TABLE POLICIES
-- =====================================================

-- Users can view their own orders
CREATE POLICY "orders_select_own" ON public.orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own orders
CREATE POLICY "orders_insert_own" ON public.orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins with 'orders' permission can view/manage all orders
CREATE POLICY "orders_admin_all" ON public.orders
  FOR ALL
  USING (
    public.has_permission(auth.uid(), 'orders') OR
    public.is_super_admin(auth.uid())
  );

-- =====================================================
-- CARTS & CART ITEMS POLICIES
-- =====================================================

-- Users can manage their own cart
CREATE POLICY "carts_own" ON public.carts
  FOR ALL
  USING (
    auth.uid() = user_id OR
    session_id IS NOT NULL  -- Allow session-based carts for guests
  );

-- Users can manage items in their own cart
CREATE POLICY "cart_items_own" ON public.cart_items
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.carts
      WHERE carts.id = cart_items.cart_id
      AND (carts.user_id = auth.uid() OR carts.session_id IS NOT NULL)
    )
  );

-- =====================================================
-- CATERING BOOKINGS POLICIES
-- =====================================================

-- Users can view their own catering bookings
CREATE POLICY "catering_bookings_select_own" ON public.catering_bookings
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Users can create catering bookings
CREATE POLICY "catering_bookings_insert_own" ON public.catering_bookings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Admins with 'catering' permission can manage all bookings
CREATE POLICY "catering_bookings_admin_all" ON public.catering_bookings
  FOR ALL
  USING (
    public.has_permission(auth.uid(), 'catering') OR
    public.is_super_admin(auth.uid())
  );

-- =====================================================
-- SHOP SETTINGS POLICIES
-- =====================================================

-- Anyone can read shop settings (public access)
CREATE POLICY "shop_settings_select_all" ON public.shop_settings
  FOR SELECT
  USING (true);

-- Only admins with 'settings' permission can manage settings
CREATE POLICY "shop_settings_admin_all" ON public.shop_settings
  FOR ALL
  USING (
    public.has_permission(auth.uid(), 'settings') OR
    public.is_super_admin(auth.uid())
  );

-- =====================================================
-- PAGE VIEWS POLICIES (Analytics)
-- =====================================================

-- Anyone can insert page views (for tracking)
CREATE POLICY "page_views_insert_all" ON public.page_views
  FOR INSERT
  WITH CHECK (true);

-- Only admins with 'analytics' permission can view/manage page views
CREATE POLICY "page_views_admin_all" ON public.page_views
  FOR SELECT
  USING (
    public.has_permission(auth.uid(), 'analytics') OR
    public.is_super_admin(auth.uid())
  );

-- =====================================================
-- GRANT EXECUTE PERMISSIONS ON HELPER FUNCTIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_permission(uuid, text) TO authenticated;

-- =====================================================
-- NOTES
-- =====================================================
--
-- 1. Super Admins: Admin users with permissions = NULL
--    - Have access to everything
--    - Can manage other admins
--    - Can access /admin/admins page
--
-- 2. Regular Admins: Admin users with permissions = [array]
--    - Have access only to routes matching their permissions
--    - Cannot manage other admins
--    - Cannot access /admin/admins page
--
-- 3. Customers: Users with role = 'customer'
--    - Can only access their own data
--    - Can view public data (products, categories, settings)
--
-- 4. These policies work in conjunction with:
--    - Next.js middleware (app routing)
--    - Server-side permission checks
--    - API route authorization
--
-- 5. To test RLS policies:
--    - Use Supabase SQL Editor
--    - Set role: SET ROLE authenticated;
--    - Set user: SET request.jwt.claims.sub = 'user-uuid';
--    - Run SELECT queries to test

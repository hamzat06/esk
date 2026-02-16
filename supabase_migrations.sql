-- =====================================================
-- COMPLETE SUPABASE SQL SETUP
-- EddySylva Kitchen - All Required Queries
-- =====================================================

-- =====================================================
-- 1. ENABLE REQUIRED EXTENSIONS
-- =====================================================

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 2. CREATE CUSTOM TYPES
-- =====================================================

-- Order status enum
DO $$ BEGIN
    CREATE TYPE order_status AS ENUM (
        'pending',
        'confirmed', 
        'preparing',
        'ready',
        'delivered',
        'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- User role enum
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'customer',
        'admin'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- 3. CREATE TABLES
-- =====================================================

-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR NOT NULL,
    description TEXT NOT NULL,
    image VARCHAR,
    amount NUMERIC NOT NULL,
    in_stock BOOLEAN NOT NULL DEFAULT true,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    options JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'customer',
    default_address JSONB,
    permissions TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    items JSONB NOT NULL,
    subtotal NUMERIC NOT NULL,
    delivery_fee NUMERIC NOT NULL DEFAULT 2.99,
    tax NUMERIC NOT NULL,
    total NUMERIC NOT NULL,
    delivery_address JSONB NOT NULL,
    status order_status NOT NULL DEFAULT 'pending',
    notes TEXT,
    payment_intent_id TEXT,
    stripe_session_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Carts table
CREATE TABLE IF NOT EXISTS public.carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cart items table
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    image TEXT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    base_price NUMERIC NOT NULL,
    options JSONB NOT NULL DEFAULT '{}'::jsonb,
    unit_price NUMERIC NOT NULL,
    total_price NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shop settings table
CREATE TABLE IF NOT EXISTS public.shop_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR NOT NULL UNIQUE,
    value JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON public.products(in_stock);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON public.cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- =====================================================
-- 5. CREATE FUNCTIONS
-- =====================================================

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_number TEXT;
BEGIN
  -- Generate format: ORD-YYYYMMDD-XXXX (e.g., ORD-20260214-0001)
  SELECT 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
         LPAD(CAST(COALESCE(MAX(CAST(SUBSTRING(order_number FROM 14) AS INTEGER)), 0) + 1 AS TEXT), 4, '0')
  INTO new_number
  FROM orders
  WHERE order_number LIKE 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-%';
  
  RETURN new_number;
END;
$$;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, permissions)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email,
    'customer',
    NULL
  );
  RETURN NEW;
END;
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. CREATE TRIGGERS
-- =====================================================

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Triggers to update updated_at column
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_carts_updated_at ON public.carts;
CREATE TRIGGER update_carts_updated_at
    BEFORE UPDATE ON public.carts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cart_items_updated_at ON public.cart_items;
CREATE TRIGGER update_cart_items_updated_at
    BEFORE UPDATE ON public.cart_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_settings ENABLE ROW LEVEL SECURITY;

-- Categories policies (public read, admin write)
CREATE POLICY "Anyone can view categories" ON public.categories
    FOR SELECT USING (true);

CREATE POLICY "Admins can insert categories" ON public.categories
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update categories" ON public.categories
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can delete categories" ON public.categories
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Products policies (public read, admin write)
CREATE POLICY "Anyone can view products" ON public.products
    FOR SELECT USING (true);

CREATE POLICY "Admins can insert products" ON public.products
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update products" ON public.products
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can delete products" ON public.products
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile" ON public.profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Orders policies
CREATE POLICY "Users can view their own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders" ON public.orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can insert their own orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update orders" ON public.orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Carts policies
CREATE POLICY "Users can view their own carts" ON public.carts
    FOR SELECT USING (auth.uid() = user_id OR session_id IS NOT NULL);

CREATE POLICY "Users can insert their own carts" ON public.carts
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own carts" ON public.carts
    FOR UPDATE USING (auth.uid() = user_id OR session_id IS NOT NULL);

CREATE POLICY "Users can delete their own carts" ON public.carts
    FOR DELETE USING (auth.uid() = user_id OR session_id IS NOT NULL);

-- Cart items policies
CREATE POLICY "Users can view their cart items" ON public.cart_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.carts
            WHERE carts.id = cart_items.cart_id
            AND (carts.user_id = auth.uid() OR carts.session_id IS NOT NULL)
        )
    );

CREATE POLICY "Users can insert their cart items" ON public.cart_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.carts
            WHERE carts.id = cart_items.cart_id
            AND (carts.user_id = auth.uid() OR carts.user_id IS NULL)
        )
    );

CREATE POLICY "Users can update their cart items" ON public.cart_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.carts
            WHERE carts.id = cart_items.cart_id
            AND (carts.user_id = auth.uid() OR carts.session_id IS NOT NULL)
        )
    );

CREATE POLICY "Users can delete their cart items" ON public.cart_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.carts
            WHERE carts.id = cart_items.cart_id
            AND (carts.user_id = auth.uid() OR carts.session_id IS NOT NULL)
        )
    );

-- Shop settings policies
CREATE POLICY "Anyone can view shop settings" ON public.shop_settings
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage shop settings" ON public.shop_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- 8. MAKE YOUR USER A SUPER ADMIN
-- =====================================================

-- Replace 'hamzatajanaku@gmail.com' with your actual email
UPDATE public.profiles 
SET 
    role = 'admin',
    permissions = NULL  -- NULL means super admin (all permissions)
WHERE email = 'hamzatajanaku@gmail.com';

-- If the profile doesn't exist yet (user hasn't signed up), 
-- you can create it manually after signup

-- =====================================================
-- 9. SAMPLE DATA (OPTIONAL)
-- =====================================================

-- Insert sample categories
INSERT INTO public.categories (title) VALUES
    ('Appetizers'),
    ('Main Course'),
    ('Desserts'),
    ('Beverages'),
    ('Soups')
ON CONFLICT DO NOTHING;

-- Insert sample shop settings
INSERT INTO public.shop_settings (key, value) VALUES
    ('business_hours', '{
        "monday": {"open": "11:00", "close": "22:00", "closed": false},
        "tuesday": {"open": "11:00", "close": "22:00", "closed": false},
        "wednesday": {"open": "11:00", "close": "22:00", "closed": false},
        "thursday": {"open": "11:00", "close": "22:00", "closed": false},
        "friday": {"open": "11:00", "close": "23:00", "closed": false},
        "saturday": {"open": "10:00", "close": "23:00", "closed": false},
        "sunday": {"open": "12:00", "close": "21:00", "closed": false}
    }'::jsonb),
    ('holidays', '[]'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- 10. VERIFY SETUP
-- =====================================================

-- Check if all tables exist
SELECT 
    tablename,
    schemaname
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check your admin status
SELECT 
    id,
    email,
    full_name,
    role,
    permissions
FROM public.profiles
WHERE email = 'hamzatajanaku@gmail.com';

-- =====================================================
-- SETUP COMPLETE! 🎉
-- =====================================================

-- Next steps:
-- 1. Verify all queries ran successfully (no errors in output)
-- 2. Check that your email is marked as admin with NULL permissions
-- 3. Configure Stripe environment variables
-- 4. Test the application!
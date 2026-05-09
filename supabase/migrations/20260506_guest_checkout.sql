-- Guest checkout support
-- Allows orders to be placed without a user account

BEGIN;

-- Make user_id nullable so guest orders have no user attached
ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;

-- Store guest contact info directly on the order
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS guest_name text,
  ADD COLUMN IF NOT EXISTS guest_email text;

-- Allow the order number generator to be called without auth (needed for guest checkout via server API)
GRANT EXECUTE ON FUNCTION public.generate_order_number() TO anon;

COMMIT;

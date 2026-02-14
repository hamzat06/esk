import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Single instance for client-side usage
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Alternative: Function that creates a new client (if you prefer this pattern)
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(url && publishableKey);

// The publishable key is safe in a browser. RLS in the migration protects writes.
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, publishableKey!)
  : null;

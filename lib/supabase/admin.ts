import { createClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client with admin privileges.
 * Utilizes SUPABASE_SERVICE_ROLE_KEY (if provided) to safely bypass RLS policies
 * for server actions and CMS administration.
 * Falls back to NEXT_PUBLIC_SUPABASE_ANON_KEY if service key is not configured.
 */
export function getAdminSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

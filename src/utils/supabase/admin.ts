import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://vcbxrdwomptrsxghtkpw.supabase.co";
const DEFAULT_SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder";
const DEFAULT_ADMIN_TOKEN = "redlix-secure-admin-token-2026";

export function getSupabaseAdminClient() {
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.trim()) || DEFAULT_SUPABASE_URL;
  const supabaseKey =
    (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY.trim()) ||
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.trim()) ||
    DEFAULT_SUPABASE_KEY;
  const adminToken = (process.env.NEXT_PUBLIC_ADMIN_SUPABASE_TOKEN && process.env.NEXT_PUBLIC_ADMIN_SUPABASE_TOKEN.trim()) || DEFAULT_ADMIN_TOKEN;

  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        "x-admin-token": adminToken,
      },
    },
  });
}

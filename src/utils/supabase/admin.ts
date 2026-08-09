import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://zemknulufleswmroqcrc.supabase.co";
const DEFAULT_SUPABASE_KEY = "sb_publishable_hVZW7O7f0ilwwoeCgip-2Q_ryUAwiiE";
const DEFAULT_ADMIN_TOKEN = "redlix-secure-admin-token-2026";

function getValidUrl(provided?: string): string {
  if (!provided) return DEFAULT_SUPABASE_URL;
  const trimmed = provided.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      new URL(trimmed);
      return trimmed;
    } catch {
      return DEFAULT_SUPABASE_URL;
    }
  }
  return DEFAULT_SUPABASE_URL;
}

function getValidKey(provided?: string): string {
  if (!provided) return DEFAULT_SUPABASE_KEY;
  const trimmed = provided.trim();
  return trimmed.length > 10 ? trimmed : DEFAULT_SUPABASE_KEY;
}

export function getSupabaseAdminClient() {
  const supabaseUrl = getValidUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseKey = getValidKey(
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
  const adminToken = (process.env.NEXT_PUBLIC_ADMIN_SUPABASE_TOKEN && process.env.NEXT_PUBLIC_ADMIN_SUPABASE_TOKEN.trim()) || DEFAULT_ADMIN_TOKEN;

  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        "x-admin-token": adminToken,
      },
    },
  });
}

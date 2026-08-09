import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const DEFAULT_SUPABASE_URL = "https://zemknulufleswmroqcrc.supabase.co";
const DEFAULT_SUPABASE_KEY = "sb_publishable_hVZW7O7f0ilwwoeCgip-2Q_ryUAwiiE";

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

const supabaseUrl = getValidUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabaseKey = getValidKey(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

export const createClient = (cookieStore: Awaited<ReturnType<typeof cookies>>) => {
  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            
            
            
          }
        },
      },
    },
  );
};

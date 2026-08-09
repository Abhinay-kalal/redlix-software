import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const DEFAULT_SUPABASE_URL = "https://vcbxrdwomptrsxghtkpw.supabase.co";
const DEFAULT_SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder";

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

export const createClient = (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse;
  }

  try {
    createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      },
    );
  } catch (err) {
    console.warn("[Supabase Middleware] Unable to initialize Supabase client:", err);
  }

  return supabaseResponse;
};

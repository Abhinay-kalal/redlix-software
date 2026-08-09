import { createBrowserClient } from "@supabase/ssr";

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

let clientInstance: ReturnType<typeof createBrowserClient> | null = null;
let currentAdminToken = "";
let currentHallTicket = "";

export const createClient = () => {
  if (typeof window === "undefined") {
    return createBrowserClient(supabaseUrl, supabaseKey);
  }

  const adminToken = localStorage.getItem("is_authenticated") === "true"
    ? (process.env.NEXT_PUBLIC_ADMIN_SUPABASE_TOKEN || "")
    : "";

  let hallTicket = "";
  try {
    const raw = sessionStorage.getItem("exam_session");
    if (raw) {
      const parsed = JSON.parse(raw);
      hallTicket = parsed.hallTicketNumber || "";
    }
  } catch {}

  if (!clientInstance || currentAdminToken !== adminToken || currentHallTicket !== hallTicket) {
    currentAdminToken = adminToken;
    currentHallTicket = hallTicket;
    clientInstance = createBrowserClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          "x-admin-token": adminToken,
          "x-candidate-hall-ticket": hallTicket
        }
      }
    });
  }
  return clientInstance;
};

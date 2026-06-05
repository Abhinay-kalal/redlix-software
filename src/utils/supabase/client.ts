import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let clientInstance: ReturnType<typeof createBrowserClient> | null = null;
let currentAdminToken = "";
let currentHallTicket = "";

export const createClient = () => {
  if (typeof window === "undefined") {
    return createBrowserClient(supabaseUrl!, supabaseKey!);
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
    clientInstance = createBrowserClient(supabaseUrl!, supabaseKey!, {
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

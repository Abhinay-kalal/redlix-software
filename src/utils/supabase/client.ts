import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let clientInstance: ReturnType<typeof createBrowserClient> | null = null;

export const createClient = () => {
  // If rendering on the server, create a fresh instance per request
  if (typeof window === "undefined") {
    return createBrowserClient(supabaseUrl!, supabaseKey!);
  }

  // Browser/client-side: return the cached singleton instance
  if (!clientInstance) {
    clientInstance = createBrowserClient(supabaseUrl!, supabaseKey!);
  }
  return clientInstance;
};

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/middleware";

// In-memory store for rate limiting (IP -> timestamps array)
const rateLimitMap = new Map<string, number[]>();

// Rate limit settings: 60 requests per 30 seconds per IP (approx 2 requests/sec)
const LIMIT_WINDOW = 30000; // 30 seconds
const MAX_REQUESTS = 60;    // max requests per window

export async function proxy(request: NextRequest) {
  const ip = (request as any).ip || request.headers.get("x-forwarded-for") || "unknown";
  const now = Date.now();

  // Get existing requests for the IP
  let timestamps = rateLimitMap.get(ip) || [];
  
  // Keep only requests within the active window
  timestamps = timestamps.filter((t) => now - t < LIMIT_WINDOW);

  // If rate limit is hit, return a 429 Too Many Requests response
  if (timestamps.length >= MAX_REQUESTS) {
    return new NextResponse(
      JSON.stringify({
        error: "Too Many Requests",
        message: "Your request limit has been exceeded. Please wait a few seconds and try again.",
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(Math.ceil(LIMIT_WINDOW / 1000)),
        },
      }
    );
  }

  // Record this request
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);

  // Prevent memory leaks: clean up old IPs from map if it grows too large
  if (rateLimitMap.size > 1000) {
    for (const [key, val] of rateLimitMap.entries()) {
      const active = val.filter((t) => now - t < LIMIT_WINDOW);
      if (active.length === 0) {
        rateLimitMap.delete(key);
      } else {
        rateLimitMap.set(key, active);
      }
    }
  }

  // Refresh cookie session
  return createClient(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files & assets:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images, icons, and logo assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

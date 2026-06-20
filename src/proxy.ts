import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/middleware";

const rateLimitMap = new Map<string, number[]>();
const LIMIT_WINDOW = 30000; 
const MAX_REQUESTS = 60;    

const strictRateLimitMap = new Map<string, number[]>();
const STRICT_LIMIT_WINDOW = 60000; 
const STRICT_MAX_REQUESTS = 6;     

export async function proxy(request: NextRequest) {
  const ip = (request as any).ip || request.headers.get("x-forwarded-for") || "unknown";
  const now = Date.now();
  const url = request.nextUrl.clone();
  const path = url.pathname;

  // Proxy hackathons module requests directly to the Go server on port 8080
  if (
    path.startsWith("/api/hackathons") ||
    path.startsWith("/api/teams") ||
    path.startsWith("/api/submissions")
  ) {
    const target = new URL(url.pathname + url.search, "http://localhost:8080");
    console.log("[PROXY MIDDLEWARE] Rewriting", path, "to", target.toString());
    return NextResponse.rewrite(target);
  }

  // 1. Strict Rate Limiting for Public Candidate Endpoints
  if (
    path === "/api/exam/verify" ||
    path === "/api/exam/start" ||
    path === "/api/register" ||
    path === "/api/register/edit"
  ) {
    let strictTimestamps = strictRateLimitMap.get(ip) || [];
    strictTimestamps = strictTimestamps.filter((t) => now - t < STRICT_LIMIT_WINDOW);

    if (strictTimestamps.length >= STRICT_MAX_REQUESTS) {
      return new NextResponse(
        JSON.stringify({
          error: "Too Many Requests",
          message: "Too many verification or access attempts. Please try again after a minute.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil(STRICT_LIMIT_WINDOW / 1000)),
          },
        }
      );
    }

    strictTimestamps.push(now);
    strictRateLimitMap.set(ip, strictTimestamps);

    if (strictRateLimitMap.size > 1000) {
      for (const [key, val] of strictRateLimitMap.entries()) {
        const active = val.filter((t) => now - t < STRICT_LIMIT_WINDOW);
        if (active.length === 0) {
          strictRateLimitMap.delete(key);
        } else {
          strictRateLimitMap.set(key, active);
        }
      }
    }
  }

  // 2. Global Rate Limiting Logic
  let timestamps = rateLimitMap.get(ip) || [];
  timestamps = timestamps.filter((t) => now - t < LIMIT_WINDOW);

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

  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);

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

  // 2. Admin Route Protection Logic
  if (path.startsWith("/admin") || path.startsWith("/dashboard") || path.startsWith("/api/admin")) {
    const host = request.headers.get("host") || "";
    const isLocal = host.includes("localhost") || host.includes("127.0.0.1") || host.includes("[::1]");
    const secretKey = process.env.ADMIN_ACCESS_SECRET || "redlix-admin-secure-passcode-777";
    const adminToken = process.env.NEXT_PUBLIC_ADMIN_SUPABASE_TOKEN || "redlix-secure-admin-token-2026";

    // A. Check for "secret knocking" parameter
    const secretQuery = url.searchParams.get("secret");
    if (secretQuery === secretKey) {
      // Set the bypass cookie and redirect to clean URL without secret query param
      url.searchParams.delete("secret");
      const redirectRes = NextResponse.redirect(url);
      redirectRes.cookies.set("admin_bypass_token", secretKey, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      return redirectRes;
    }

    // B. Check for existing cookie token
    const bypassCookie = request.cookies.get("admin_bypass_token")?.value;
    const hasValidCookie = bypassCookie === secretKey;

    // C. Deny access if neither localhost nor valid cookie exists (Stealth gate)
    if (!isLocal && !hasValidCookie) {
      if (path.startsWith("/api/")) {
        return new NextResponse(
          JSON.stringify({ error: "Not Found" }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      } else {
        // Redirect pages to public scheduled-exams list
        return NextResponse.redirect(new URL("/scheduled-exams", request.url));
      }
    }

    // D. Admin Login Session Cookie Gate for /dashboard and /api/admin (except /api/admin/login)
    if (path.startsWith("/dashboard") || (path.startsWith("/api/admin") && !path.startsWith("/api/admin/login"))) {
      const sessionCookie = request.cookies.get("admin_session_token")?.value;
      if (sessionCookie !== adminToken) {
        if (path.startsWith("/api/")) {
          return new NextResponse(
            JSON.stringify({ error: "Unauthorized" }),
            {
              status: 401,
              headers: { "Content-Type": "application/json" },
            }
          );
        } else {
          // Redirect to login page
          return NextResponse.redirect(new URL("/admin", request.url));
        }
      }
    }
  }

  // 3. Supabase SSR Client Session handler
  return createClient(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

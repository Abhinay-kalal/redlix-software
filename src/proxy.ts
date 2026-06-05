import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/middleware";


const rateLimitMap = new Map<string, number[]>();


const LIMIT_WINDOW = 30000; 
const MAX_REQUESTS = 60;    

export async function proxy(request: NextRequest) {
  const ip = (request as any).ip || request.headers.get("x-forwarded-for") || "unknown";
  const now = Date.now();

  
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

  
  return createClient(request);
}

export const config = {
  matcher: [
    






    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

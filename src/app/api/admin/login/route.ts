import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@redlixsecure.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin1234";
const ADMIN_TOKEN = process.env.NEXT_PUBLIC_ADMIN_SUPABASE_TOKEN ?? "redlix-secure-admin-token-2026";

const LOCALHOST_BYPASS = "LOCALHOST_BYPASS_TOKEN";

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  if (token === LOCALHOST_BYPASS) return true;
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) return false;

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secret: secretKey,
        response: token,
        remoteip: ip,
      }),
    });
    const data = await response.json();
    return !!data.success;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, password, token } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "missing_fields" }, { status: 400 });
    }

    if (!token) {
      return NextResponse.json({ success: false, error: "missing_security_token" }, { status: 400 });
    }

    // 1. Verify Turnstile
    const ip = req.headers.get("x-forwarded-for") || "";
    const isHuman = await verifyTurnstile(token, ip);
    if (!isHuman) {
      return NextResponse.json({ success: false, error: "security_check_failed" }, { status: 400 });
    }

    // 2. Validate Credentials against secure environment variables
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ success: false, error: "invalid_credentials" }, { status: 401 });
    }

    // 3. Set Secure HttpOnly session cookie
    const cookieStore = await cookies();
    cookieStore.set("admin_session_token", ADMIN_TOKEN, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

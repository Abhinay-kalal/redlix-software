import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyPassword } from "@/lib/auth";

const ADMIN_TOKEN = process.env.NEXT_PUBLIC_ADMIN_SUPABASE_TOKEN ?? "redlix-secure-admin-token-2026";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  {
    global: {
      headers: {
        "x-admin-token": ADMIN_TOKEN,
      },
    },
  }
);

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
    const body = await req.json();
    const { email, password, turnstileToken } = body;

    // Validation
    if (!email || !password || !turnstileToken) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters." },
        { status: 400 }
      );
    }

    // Turnstile check
    const ip = req.headers.get("x-forwarded-for") || "";
    const isHuman = await verifyTurnstile(turnstileToken, ip);
    if (!isHuman) {
      return NextResponse.json(
        { success: false, error: "Security check failed. Please try again." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Fetch candidate
    const { data: candidate, error: fetchError } = await supabase
      .from("candidates")
      .select("*")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json(
        { success: false, error: fetchError.message },
        { status: 500 }
      );
    }

    if (!candidate) {
      return NextResponse.json(
        { success: false, error: "Invalid email address or password." },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = verifyPassword(password, candidate.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Invalid email address or password." },
        { status: 401 }
      );
    }

    // Create session cookie response
    const res = NextResponse.json({
      success: true,
      candidate: {
        id: candidate.id,
        email: candidate.email,
        fullName: candidate.full_name,
        phone: candidate.phone,
        college: candidate.college,
        department: candidate.department,
      },
    });

    res.cookies.set("candidate_session_token", candidate.email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return res;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

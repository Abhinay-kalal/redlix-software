import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/utils/supabase/admin";
import { hashPassword } from "@/lib/auth";

const supabase = getSupabaseAdminClient();

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
    const {
      fullName,
      email,
      password,
      phone,
      college,
      department,
      turnstileToken,
    } = body;

    // Validation
    if (!fullName || !email || !password || !turnstileToken) {
      return NextResponse.json(
        { success: false, error: "Missing required registration parameters." },
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

    // Check if duplicate email
    const { data: existingUser, error: checkError } = await supabase
      .from("candidates")
      .select("id")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "A candidate with this email already exists." },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = hashPassword(password);

    // Insert into db
    const { error: insertError } = await supabase
      .from("candidates")
      .insert({
        full_name: fullName.trim(),
        email: cleanEmail,
        password: hashedPassword,
        phone: phone ? phone.trim() : null,
        college: college ? college.trim() : null,
        department: department ? department.trim() : null,
      });

    if (insertError) {
      return NextResponse.json(
        { success: false, error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

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

function isAdminAuthorized(req: NextRequest): boolean {
  const token = req.headers.get("x-admin-token");
  const cookieToken = req.cookies.get("admin_session_token")?.value;
  return token === ADMIN_TOKEN || cookieToken === ADMIN_TOKEN;
}

function serialize(obj: any) {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const resource = searchParams.get("resource");

  if (resource === "exams") {
    try {
      const data = await prisma.$queryRawUnsafe(`SELECT * FROM exams ORDER BY id DESC`);
      return NextResponse.json({ success: true, data: serialize(data) });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
  }

  if (resource === "registrations") {
    try {
      const data = await prisma.$queryRawUnsafe(`SELECT * FROM registrations ORDER BY id DESC`);
      return NextResponse.json({ success: true, data: serialize(data) });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
  }

  if (resource === "sessions") {
    try {
      const data = await prisma.$queryRawUnsafe(`SELECT * FROM sessions ORDER BY timestamp ASC`);
      return NextResponse.json({ success: true, data: serialize(data) });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
  }

  if (resource === "security_logs") {
    try {
      const data = await prisma.$queryRawUnsafe(`SELECT * FROM security_logs ORDER BY created_at DESC`);
      return NextResponse.json({ success: true, data: serialize(data) });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: false, error: "Unknown resource" }, { status: 400 });
}


export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { action } = body;

  // Create exam
  if (action === "create_exam") {
    const { examData } = body;
    const { error } = await supabase.from("exams").insert(examData);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  // Toggle is_started
  if (action === "toggle_started") {
    const { examId, value } = body;
    const { error } = await supabase
      .from("exams")
      .update({ is_started: value })
      .eq("id", examId);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  // Toggle show_login
  if (action === "toggle_show_login") {
    const { examId, value } = body;
    const { error } = await supabase
      .from("exams")
      .update({ show_login: value })
      .eq("id", examId);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  // Generate (or clear) 6-digit submit code
  if (action === "generate_submit_code") {
    const { examId } = body;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const { error } = await supabase
      .from("exams")
      .update({ submit_code: code })
      .eq("id", examId);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, code });
  }

  // Clear submit code (make it null so exam ends without code gate)
  if (action === "clear_submit_code") {
    const { examId } = body;
    const { error } = await supabase
      .from("exams")
      .update({ submit_code: null })
      .eq("id", examId);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  // Resolve session flags
  if (action === "resolve_session") {
    const { sessionId } = body;
    const { error } = await supabase
      .from("sessions")
      .update({ flags_count: 0, integrity_score: 100, severity: "Normal", last_flag_type: "None (Resolved)" })
      .eq("id", sessionId);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  // Dismiss (delete) session
  if (action === "dismiss_session") {
    const { sessionId } = body;
    const { error } = await supabase.from("sessions").delete().eq("id", sessionId);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  // Re-enable blocked exam
  if (action === "re_enable_exam") {
    const { hallTicketNumber } = body;
    const { error } = await supabase
      .from("registrations")
      .update({ blocked: false, answers: {} })
      .eq("hall_ticket_number", hallTicketNumber);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    // Also delete any existing session to ensure a clean login
    await supabase.from("sessions").delete().eq("id", hallTicketNumber);

    return NextResponse.json({ success: true });
  }

  // Logout admin session
  if (action === "logout") {
    const res = NextResponse.json({ success: true });
    res.cookies.set("admin_session_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    });
    return res;
  }

  return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
}

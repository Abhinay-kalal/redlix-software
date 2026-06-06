import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { hallTicketNumber, visitorId } = body as {
      hallTicketNumber?: string;
      visitorId?: string;
    };

    if (!hallTicketNumber || !visitorId) {
      return NextResponse.json(
        { success: false, error: "Missing hallTicketNumber or visitorId" },
        { status: 400 }
      );
    }

    const ADMIN_TOKEN = process.env.NEXT_PUBLIC_ADMIN_SUPABASE_TOKEN ?? "redlix-secure-admin-token-2026";
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY ??
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        global: {
          headers: {
            "x-admin-token": ADMIN_TOKEN,
            "x-candidate-hall-ticket": hallTicketNumber,
          },
        },
      }
    );

    // 1. Check if there is an EXISTING active session with a DIFFERENT visitorId
    const { data: existing, error: fetchError } = await supabase
      .from("sessions")
      .select("id, visitor_id")
      .eq("id", hallTicketNumber)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching session:", fetchError);
      return NextResponse.json(
        { success: false, error: "Database error" },
        { status: 500 }
      );
    }

    if (existing && existing.visitor_id && existing.visitor_id !== visitorId) {
      // Another device is actively running this exam – reject
      await supabase.from("security_logs").insert({
        session_id: hallTicketNumber,
        visitor_id: visitorId,
        event_type: "CONCURRENT_DEVICE_ATTEMPT",
        details: `Login attempted from a different device. Registered visitor_id: ${existing.visitor_id}, new visitor_id: ${visitorId}`,
        ip_address: req.headers.get("x-forwarded-for") ?? "unknown",
        user_agent: req.headers.get("user-agent") ?? "unknown",
      });

      return NextResponse.json(
        {
          success: false,
          error: "concurrent_device",
          message:
            "This exam is already active on another device. Only one device is allowed per candidate.",
        },
        { status: 403 }
      );
    }

    // 2. If the session row already exists, update visitor_id on it.
    //    If it doesn't exist yet (exam hasn't started), skip — initDBSession in
    //    exam-session will create the full row and include visitor_id there.
    if (existing) {
      const { error: updateError } = await supabase
        .from("sessions")
        .update({ visitor_id: visitorId })
        .eq("id", hallTicketNumber);

      if (updateError) {
        console.error("Error updating visitor_id on session:", updateError);
        // Non-fatal — still allow the exam; log and continue
      }
    }

    // 3. Log the fingerprint registration event
    await supabase.from("security_logs").insert({
      session_id: hallTicketNumber,
      visitor_id: visitorId,
      event_type: "DEVICE_FINGERPRINT_REGISTERED",
      details: existing
        ? "Device fingerprint registered to existing session"
        : "Device fingerprint recorded at login (session not yet started)",
      ip_address: req.headers.get("x-forwarded-for") ?? "unknown",
      user_agent: req.headers.get("user-agent") ?? "unknown",
    });

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("Unexpected error in /api/exam/start:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

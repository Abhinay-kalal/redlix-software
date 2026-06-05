import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use service-role key for trusted server-side writes
// Falls back to publishable key if service role key is not yet configured
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

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

    // 2. Upsert the visitor_id into the sessions row
    const { error: upsertError } = await supabase
      .from("sessions")
      .upsert({ id: hallTicketNumber, visitor_id: visitorId });

    if (upsertError) {
      console.error("Error upserting session:", upsertError);
      return NextResponse.json(
        { success: false, error: "Failed to register device fingerprint" },
        { status: 500 }
      );
    }

    // 3. Log the successful start event
    await supabase.from("security_logs").insert({
      session_id: hallTicketNumber,
      visitor_id: visitorId,
      event_type: "EXAM_START",
      details: "Exam session started with registered device fingerprint",
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

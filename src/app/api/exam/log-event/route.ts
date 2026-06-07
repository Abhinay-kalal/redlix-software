import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, visitorId, eventType, details } = body as {
      sessionId?: string;
      visitorId?: string;
      eventType?: string;
      details?: string;
    };

    if (!sessionId || !eventType) {
      return NextResponse.json(
        { success: false, error: "Missing sessionId or eventType" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY ??
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        global: {
          headers: {
            "x-candidate-hall-ticket": sessionId,
          },
        },
      }
    );

    await supabase.from("security_logs").insert({
      session_id: sessionId,
      visitor_id: visitorId ?? null,
      event_type: eventType,
      details: details ?? null,
      ip_address: req.headers.get("x-forwarded-for") ?? "unknown",
      user_agent: req.headers.get("user-agent") ?? "unknown",
    });

    if (eventType === "PROCTORING_VIOLATION") {
      const { error: blockError } = await supabase
        .from("registrations")
        .update({ blocked: true })
        .eq("hall_ticket_number", sessionId);
      if (blockError) {
        console.error("Failed to block registration:", blockError.message);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error logging security event:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

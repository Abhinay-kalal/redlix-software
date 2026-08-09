import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/utils/supabase/admin";

const supabase = getSupabaseAdminClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hallTicketNumber = searchParams.get("hallTicketNumber");

    if (!hallTicketNumber) {
      return NextResponse.json(
        { success: false, error: "Missing hallTicketNumber" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("registrations")
      .select("answers, blocked")
      .ilike("hall_ticket_number", hallTicketNumber.trim())
      .maybeSingle();

    if (error) {
      console.error("Failed to fetch answers from registrations:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      answers: data?.answers ?? {},
      blocked: data?.blocked ?? false,
    });
  } catch (err: any) {
    console.error("Unexpected error in GET save-answers API:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { hallTicketNumber, answers } = body as {
      hallTicketNumber?: string;
      answers?: Record<string | number, string>;
    };

    if (!hallTicketNumber || !answers) {
      return NextResponse.json(
        { success: false, error: "Missing hallTicketNumber or answers" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("registrations")
      .update({ answers })
      .eq("hall_ticket_number", hallTicketNumber);

    if (error) {
      console.error("Failed to save answers to registrations:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Unexpected error in save-answers API:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

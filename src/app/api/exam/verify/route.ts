import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Service role bypasses RLS — safe to use server-side only
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { hallTicketNumber, candidateName } = body as {
      hallTicketNumber?: string;
      candidateName?: string;
    };

    if (!hallTicketNumber || !candidateName) {
      return NextResponse.json(
        { success: false, error: "missing_fields" },
        { status: 400 }
      );
    }

    // 1. Look up registration by hall ticket (service role bypasses RLS)
    const { data: reg, error: regError } = await supabase
      .from("registrations")
      .select(
        "id, candidate_name, exam_id, photo_url, registration_number, hall_ticket_number"
      )
      .ilike("hall_ticket_number", hallTicketNumber.trim())
      .maybeSingle();

    if (regError) {
      console.error("DB error looking up registration:", regError);
      return NextResponse.json(
        { success: false, error: "db_error" },
        { status: 500 }
      );
    }

    if (!reg) {
      return NextResponse.json(
        { success: false, error: "not_found" },
        { status: 404 }
      );
    }

    // 2. Validate name match (case-insensitive)
    if (
      reg.candidate_name.toLowerCase().trim() !==
      candidateName.toLowerCase().trim()
    ) {
      return NextResponse.json(
        { success: false, error: "name_mismatch" },
        { status: 401 }
      );
    }

    // 3. Fetch exam details
    const { data: exam, error: examError } = await supabase
      .from("exams")
      .select(
        "id, name, company_name, company_logo, date, time, description, total_qns, types_of_qns"
      )
      .eq("id", reg.exam_id)
      .maybeSingle();

    if (examError || !exam) {
      return NextResponse.json(
        { success: false, error: "exam_not_found" },
        { status: 404 }
      );
    }

    // 4. Return safe session payload (no sensitive data beyond what candidate already knows)
    return NextResponse.json({
      success: true,
      candidate: {
        candidateName: reg.candidate_name,
        hallTicketNumber: reg.hall_ticket_number,
        registrationNumber: reg.registration_number,
        photoUrl: reg.photo_url,
      },
      exam,
    });
  } catch (err) {
    console.error("Unexpected error in /api/exam/verify:", err);
    return NextResponse.json(
      { success: false, error: "internal_error" },
      { status: 500 }
    );
  }
}

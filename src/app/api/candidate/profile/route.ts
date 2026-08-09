import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/utils/supabase/admin";

export async function GET(req: NextRequest) {
  const supabase = getSupabaseAdminClient();
  try {
    // Read session cookie
    const emailCookie = req.cookies.get("candidate_session_token")?.value;
    
    // Support fallback email header for flexibility or local dev testing
    const emailHeader = req.headers.get("x-candidate-email");
    const candidateEmail = emailCookie || emailHeader;

    if (!candidateEmail) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // Fetch candidate details
    const { data: candidate, error: candidateError } = await supabase
      .from("candidates")
      .select("id, full_name, email, phone, college, department, created_at")
      .eq("email", candidateEmail.trim().toLowerCase())
      .maybeSingle();

    if (candidateError) {
      return NextResponse.json(
        { success: false, error: candidateError.message },
        { status: 500 }
      );
    }

    if (!candidate) {
      return NextResponse.json(
        { success: false, error: "Candidate profile not found." },
        { status: 404 }
      );
    }

    // Fetch candidate registrations alongside their exam details
    // Registrations table has column email and exam_id
    const { data: registrations, error: registrationsError } = await supabase
      .from("registrations")
      .select(`
        id,
        exam_id,
        candidate_name,
        email,
        phone,
        college,
        department,
        year_of_study,
        photo_url,
        registration_number,
        hall_ticket_number,
        created_at,
        blocked,
        exams (
          id,
          name,
          company_name,
          date,
          time,
          description,
          total_qns,
          types_of_qns,
          is_started,
          show_login
        )
      `)
      .eq("email", candidate.email);

    if (registrationsError) {
      return NextResponse.json(
        { success: false, error: registrationsError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      candidate,
      registrations: registrations || [],
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

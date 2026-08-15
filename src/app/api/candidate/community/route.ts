import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/utils/supabase/admin";

/**
 * GET /api/candidate/community
 * Returns all other candidates registered for the same exams as the logged-in candidate.
 * Does NOT expose emails or passwords — only public profile fields.
 */
export async function GET(req: NextRequest) {
  const supabase = getSupabaseAdminClient();
  try {
    const emailCookie = req.cookies.get("candidate_session_token")?.value;
    const emailHeader = req.headers.get("x-candidate-email");
    const candidateEmail = emailCookie || emailHeader;

    if (!candidateEmail) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // Step 1: Get the current candidate's registered exam IDs
    const { data: myRegs, error: myRegsError } = await supabase
      .from("registrations")
      .select("exam_id")
      .eq("email", candidateEmail.trim().toLowerCase());

    if (myRegsError) {
      return NextResponse.json(
        { success: false, error: myRegsError.message },
        { status: 500 }
      );
    }

    const examIds = (myRegs || []).map((r: any) => r.exam_id);

    if (examIds.length === 0) {
      return NextResponse.json({ success: true, community: [] });
    }

    // Step 2: Get all OTHER candidates registered for the same exams
    const { data: coRegs, error: coRegsError } = await supabase
      .from("registrations")
      .select(`
        id,
        candidate_name,
        college,
        department,
        year_of_study,
        photo_url,
        exam_id,
        exams (
          id,
          name,
          company_name
        )
      `)
      .in("exam_id", examIds)
      .neq("email", candidateEmail.trim().toLowerCase());

    if (coRegsError) {
      return NextResponse.json(
        { success: false, error: coRegsError.message },
        { status: 500 }
      );
    }

    // Deduplicate by candidate_name + college (same person registered for multiple exams)
    const seen = new Set<string>();
    const community: any[] = [];
    for (const r of (coRegs || [])) {
      const key = `${r.candidate_name}|${r.college}`;
      if (!seen.has(key)) {
        seen.add(key);
        community.push({
          id: r.id,
          name: r.candidate_name,
          college: r.college,
          department: r.department,
          year_of_study: r.year_of_study,
          photo_url: r.photo_url,
          exam_name: (r.exams as any)?.name,
          company_name: (r.exams as any)?.company_name,
        });
      }
    }

    return NextResponse.json({ success: true, community });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

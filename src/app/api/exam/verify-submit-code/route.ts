import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { examId, code } = body as { examId?: number; code?: string };

    if (!examId || !code) {
      return NextResponse.json(
        { success: false, error: "missing_fields" },
        { status: 400 }
      );
    }

    const { data: exam, error } = await supabase
      .from("exams")
      .select("submit_code")
      .eq("id", examId)
      .maybeSingle();

    if (error || !exam) {
      return NextResponse.json(
        { success: false, error: "exam_not_found" },
        { status: 404 }
      );
    }

    // If no submit_code is set on the exam, allow submission freely
    if (!exam.submit_code) {
      return NextResponse.json({ success: true, noCodeRequired: true });
    }

    if (exam.submit_code.trim() === code.trim()) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: "invalid_code" },
      { status: 403 }
    );
  } catch (err) {
    console.error("Error in /api/exam/verify-submit-code:", err);
    return NextResponse.json(
      { success: false, error: "internal_error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const examId = searchParams.get("examId");

  if (!examId) {
    return NextResponse.json({ success: false, error: "Missing examId" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("exams")
    .select("id, is_started, show_login")
    .eq("id", Number(examId))
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ success: false, error: "Exam not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    isStarted: data.is_started ?? false,
    showLogin: data.show_login ?? false,
  });
}

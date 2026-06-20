import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const resource = searchParams.get("resource");

  // List all exams with completion stats
  if (resource === "exams") {
    const { data: exams, error: examsErr } = await supabase
      .from("exams")
      .select("id, name, date, time, company_name, company_logo")
      .order("id", { ascending: false });

    if (examsErr) return NextResponse.json({ success: false, error: examsErr.message }, { status: 500 });

    const { data: regs } = await supabase
      .from("registrations")
      .select("exam_id, answers");

    const stats = (exams ?? []).map((exam) => {
      const examRegs = (regs ?? []).filter((r) => r.exam_id === exam.id);
      const attempted = examRegs.filter((r) => {
        if (!r.answers || typeof r.answers !== "object") return false;
        return Object.values(r.answers).some((v: any) => v && v.toString().trim() !== "");
      }).length;
      return { ...exam, total_registered: examRegs.length, total_attempted: attempted };
    });

    return NextResponse.json({ success: true, data: stats });
  }

  // List candidates who took an exam
  if (resource === "candidates") {
    const examId = searchParams.get("examId");
    if (!examId) return NextResponse.json({ success: false, error: "missing examId" }, { status: 400 });

    const { data, error } = await supabase
      .from("registrations")
      .select("id, candidate_name, hall_ticket_number, email, photo_url, registration_number, answers")
      .eq("exam_id", examId)
      .order("candidate_name");

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    const withStats = (data ?? []).map((r) => {
      const answers = r.answers || {};
      const mcqAnswered = Object.entries(answers).filter(([k, v]: any) => {
        const qId = Number(k);
        const isGeneralMCQ = qId >= 1 && qId <= 100;
        const isTrainingMCQ = qId >= 1001 && qId <= 1017;
        return (isGeneralMCQ || isTrainingMCQ) && v && v.toString().trim();
      }).length;
      const codingAnswered = Object.entries(answers).filter(([k, v]: any) => {
        const qId = Number(k);
        const isGeneralCoding = qId >= 101 && qId <= 110;
        const isTrainingCoding = qId >= 1018 && qId <= 1021;
        return (isGeneralCoding || isTrainingCoding) && v && v.toString().trim();
      }).length;
      const attempted = mcqAnswered > 0 || codingAnswered > 0;
      return {
        id: r.id,
        candidate_name: r.candidate_name,
        hall_ticket_number: r.hall_ticket_number,
        email: r.email,
        photo_url: r.photo_url,
        registration_number: r.registration_number,
        mcq_answered: mcqAnswered,
        coding_answered: codingAnswered,
        attempted,
        answers: r.answers || {},
      };
    });

    return NextResponse.json({ success: true, data: withStats });
  }

  // Get full answers for a candidate
  if (resource === "answers") {
    const hallTicket = searchParams.get("hallTicket");
    if (!hallTicket) return NextResponse.json({ success: false, error: "missing hallTicket" }, { status: 400 });

    const { data, error } = await supabase
      .from("registrations")
      .select("candidate_name, hall_ticket_number, email, exam_id, answers")
      .ilike("hall_ticket_number", hallTicket)
      .maybeSingle();

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ success: false, error: "not_found" }, { status: 404 });

    return NextResponse.json({ success: true, data });
  }

  return NextResponse.json({ success: false, error: "Unknown resource" }, { status: 400 });
}

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/utils/supabase/admin";



export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdminClient();
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "lookup") {
      const { registrationNumber, hallTicketNumber } = body;
      if (!registrationNumber || !hallTicketNumber) {
        return NextResponse.json({ success: false, error: "Missing lookup parameters." }, { status: 400 });
      }

      // Query registrations table using admin bypass client
      const { data: reg, error: regError } = await supabase
        .from("registrations")
        .select()
        .eq("registration_number", registrationNumber.trim())
        .ilike("hall_ticket_number", hallTicketNumber.trim())
        .maybeSingle();

      if (regError) {
        return NextResponse.json({ success: false, error: regError.message }, { status: 500 });
      }

      if (!reg) {
        return NextResponse.json({ success: false, error: "No matching registration record found." }, { status: 404 });
      }

      // Query exam details
      const { data: exam, error: examError } = await supabase
        .from("exams")
        .select("name, company_name")
        .eq("id", reg.exam_id)
        .maybeSingle();

      return NextResponse.json({
        success: true,
        registration: reg,
        exam: exam || { name: "Exam", company_name: "Company" }
      });
    }

    if (action === "update") {
      const {
        id,
        candidate_name,
        email,
        phone,
        college,
        department,
        year_of_study,
        photo_url,
        turnstileToken
      } = body;

      if (!id || !candidate_name || !email || !phone || !college || !department || !year_of_study || !photo_url) {
        return NextResponse.json({ success: false, error: "Missing update fields." }, { status: 400 });
      }



      const { error: updateError } = await supabase
        .from("registrations")
        .update({
          candidate_name: candidate_name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          college: college.trim(),
          department: department.trim(),
          year_of_study,
          photo_url
        })
        .eq("id", id);

      if (updateError) {
        return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Unknown action." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/utils/supabase/admin";

/**
 * GET /api/candidate/connections
 * Returns ALL connections for the current candidate — sent, received, and accepted.
 */
export async function GET(req: NextRequest) {
  const supabase = getSupabaseAdminClient();
  const email = req.cookies.get("candidate_session_token")?.value || req.headers.get("x-candidate-email");
  if (!email) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const myEmail = email.trim().toLowerCase();

  // Connections I sent
  const { data: sent } = await supabase
    .from("CandidateConnection")
    .select("id, from_email, from_name, to_registration_id, to_name, to_email, status, created_at")
    .eq("from_email", myEmail)
    .order("created_at", { ascending: false });

  // My registration IDs (to find connections sent TO me)
  const { data: myRegs } = await supabase
    .from("registrations")
    .select("id")
    .eq("email", myEmail);
  const myRegIds = (myRegs || []).map((r: any) => r.id);

  let received: any[] = [];
  if (myRegIds.length) {
    const { data } = await supabase
      .from("CandidateConnection")
      .select("id, from_email, from_name, to_registration_id, to_name, to_email, status, created_at")
      .in("to_registration_id", myRegIds)
      .order("created_at", { ascending: false });
    received = data || [];
  }

  return NextResponse.json({
    success: true,
    sent: sent || [],
    received,
  });
}

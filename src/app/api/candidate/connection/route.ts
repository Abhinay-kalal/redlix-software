import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/utils/supabase/admin";

/** GET /api/candidate/connection?with={registrationId} */
export async function GET(req: NextRequest) {
  const supabase = getSupabaseAdminClient();
  const email = req.cookies.get("candidate_session_token")?.value || req.headers.get("x-candidate-email");
  if (!email) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const toRegId = req.nextUrl.searchParams.get("with");
  if (!toRegId) return NextResponse.json({ success: false, error: "Missing 'with' param" }, { status: 400 });

  const toRegIdInt = parseInt(toRegId);
  const myEmail = email.trim().toLowerCase();

  // Check if I sent a request to them
  const { data: sent } = await supabase
    .from("CandidateConnection")
    .select("id, status")
    .eq("from_email", myEmail)
    .eq("to_registration_id", toRegIdInt)
    .maybeSingle();

  if (sent) return NextResponse.json({ success: true, connection: sent, direction: "sent" });

  // Get the target candidate's email via their registration
  const { data: targetReg } = await supabase
    .from("registrations")
    .select("email")
    .eq("id", toRegIdInt)
    .maybeSingle();

  const targetEmail = targetReg?.email || "";

  // Get my registration IDs
  const { data: myRegs } = await supabase
    .from("registrations")
    .select("id")
    .eq("email", myEmail);
  const myRegIds = (myRegs || []).map((r: any) => r.id);

  if (!myRegIds.length || !targetEmail) {
    return NextResponse.json({ success: true, connection: null, direction: "none" });
  }

  // Check if they sent me a request
  const { data: received } = await supabase
    .from("CandidateConnection")
    .select("id, status, from_name")
    .in("to_registration_id", myRegIds)
    .eq("from_email", targetEmail)
    .maybeSingle();

  if (received) return NextResponse.json({ success: true, connection: received, direction: "received" });

  return NextResponse.json({ success: true, connection: null, direction: "none" });
}

/** POST /api/candidate/connection — Send a friend request */
export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdminClient();
  const email = req.cookies.get("candidate_session_token")?.value || req.headers.get("x-candidate-email");
  if (!email) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { to_registration_id, from_name } = await req.json();
  if (!to_registration_id) return NextResponse.json({ success: false, error: "Missing to_registration_id" }, { status: 400 });

  const myEmail = email.trim().toLowerCase();
  const toRegIdInt = parseInt(String(to_registration_id));

  // Fetch target name
  const { data: targetReg } = await supabase
    .from("registrations")
    .select("candidate_name")
    .eq("id", toRegIdInt)
    .maybeSingle();

  // Check if a connection already exists to avoid duplicate
  const { data: existing } = await supabase
    .from("CandidateConnection")
    .select("id, status")
    .eq("from_email", myEmail)
    .eq("to_registration_id", toRegIdInt)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ success: true, connection: existing });
  }

  const { data, error } = await supabase
    .from("CandidateConnection")
    .insert({
      from_email: myEmail,
      from_name: from_name || myEmail,
      to_registration_id: toRegIdInt,
      to_name: targetReg?.candidate_name || "",
      to_email: "",
      status: "pending",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, connection: data });
}

/** PATCH /api/candidate/connection — Accept or reject a request */
export async function PATCH(req: NextRequest) {
  const supabase = getSupabaseAdminClient();
  const email = req.cookies.get("candidate_session_token")?.value || req.headers.get("x-candidate-email");
  if (!email) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { connection_id, action, my_name } = await req.json();
  if (!connection_id || !action) return NextResponse.json({ success: false, error: "Missing params" }, { status: 400 });

  const { data, error } = await supabase
    .from("CandidateConnection")
    .update({ status: action, to_email: email.trim().toLowerCase(), to_name: my_name || "" })
    .eq("id", connection_id)
    .select()
    .single();

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, connection: data });
}

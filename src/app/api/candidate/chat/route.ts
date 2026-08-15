import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/utils/supabase/admin";

/** GET /api/candidate/chat?connection={id}  — fetch messages for a connection */
export async function GET(req: NextRequest) {
  const supabase = getSupabaseAdminClient();
  const email = req.cookies.get("candidate_session_token")?.value || req.headers.get("x-candidate-email");
  if (!email) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const connectionId = req.nextUrl.searchParams.get("connection");
  if (!connectionId) return NextResponse.json({ success: false, error: "Missing connection param" }, { status: 400 });

  const { data, error } = await supabase
    .from("CandidateChatMessage")
    .select("id, sender_email, sender_name, message, created_at")
    .eq("connection_id", connectionId)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, messages: data || [] });
}

/** POST /api/candidate/chat  — send a message */
export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdminClient();
  const email = req.cookies.get("candidate_session_token")?.value || req.headers.get("x-candidate-email");
  if (!email) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { connection_id, message, sender_name } = await req.json();
  if (!connection_id || !message?.trim()) return NextResponse.json({ success: false, error: "Missing params" }, { status: 400 });

  const { data, error } = await supabase
    .from("CandidateChatMessage")
    .insert({
      connection_id,
      sender_email: email.trim().toLowerCase(),
      sender_name: sender_name || email,
      message: message.trim(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, message: data });
}

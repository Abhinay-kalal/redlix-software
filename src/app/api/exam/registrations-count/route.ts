import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/utils/supabase/admin";

const supabase = getSupabaseAdminClient();

export async function GET(req: NextRequest) {
  try {
    const { data, error } = await supabase
      .from("registrations")
      .select("exam_id");

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Aggregate counts
    const counts: Record<number, number> = {};
    data.forEach((r: any) => {
      counts[r.exam_id] = (counts[r.exam_id] || 0) + 1;
    });

    return NextResponse.json({ success: true, counts });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

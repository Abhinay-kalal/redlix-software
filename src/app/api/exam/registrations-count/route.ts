import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ADMIN_TOKEN = process.env.NEXT_PUBLIC_ADMIN_SUPABASE_TOKEN ?? "redlix-secure-admin-token-2026";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  {
    global: {
      headers: {
        "x-admin-token": ADMIN_TOKEN,
      },
    },
  }
);

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

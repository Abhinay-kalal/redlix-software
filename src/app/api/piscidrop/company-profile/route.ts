import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/utils/supabase/admin";

const supabase = getSupabaseAdminClient();

export async function GET(req: NextRequest) {
  try {
    const { data, error } = await supabase
      .from("piscidrop_company_profile")
      .select("*")
      .eq("id", 1)
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      description,
      founder,
      date_started,
      website,
      phone,
      email,
      address,
      logo_url,
    } = body;

    // Basic validation
    if (!name) {
      return NextResponse.json({ success: false, error: "Company name is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("piscidrop_company_profile")
      .update({
        name,
        description,
        founder,
        date_started,
        website,
        phone,
        email,
        address,
        logo_url,
      })
      .eq("id", 1)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

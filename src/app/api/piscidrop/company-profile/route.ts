import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase with headers that include the admin token to bypass RLS policies for updates
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  {
    global: {
      headers: {
        "x-admin-token": "redlix-secure-admin-token-2026",
      },
    },
  }
);

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

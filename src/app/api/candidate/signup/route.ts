import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/utils/supabase/admin";
import { hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdminClient();
  try {
    const body = await req.json();
    const {
      fullName,
      email,
      password,
      phone,
      college,
      department,
    } = body;

    // Validation
    if (!fullName || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Missing required registration parameters." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if duplicate email
    const { data: existingUser, error: checkError } = await supabase
      .from("candidates")
      .select("id")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "A candidate with this email already exists." },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = hashPassword(password);

    // Insert into db
    const { error: insertError } = await supabase
      .from("candidates")
      .insert({
        full_name: fullName.trim(),
        email: cleanEmail,
        password: hashedPassword,
        phone: phone ? phone.trim() : null,
        college: college ? college.trim() : null,
        department: department ? department.trim() : null,
      });

    if (insertError) {
      return NextResponse.json(
        { success: false, error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/utils/supabase/admin";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdminClient();
  try {
    const { action, email, otp, password } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. SEND OTP ACTION
    if (action === "send-otp") {
      // Confirm candidate exists
      const { data: candidate, error: candidateErr } = await supabase
        .from("candidates")
        .select("id")
        .eq("email", cleanEmail)
        .maybeSingle();

      if (candidateErr) {
        return NextResponse.json({ success: false, error: candidateErr.message }, { status: 500 });
      }

      if (!candidate) {
        return NextResponse.json({ success: false, error: "No candidate account found with this email." }, { status: 404 });
      }

      // Generate a 6-digit numeric OTP
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

      // Save to database
      await prisma.candidateOtp.create({
        data: {
          email: cleanEmail,
          otp: generatedOtp,
          expiresAt
        }
      });

      // Send verification email using Resend
      try {
        const { sendEmail } = await import("@/lib/resend");
        await sendEmail({
          to: cleanEmail,
          subject: "Redlix Security Code: Reset Password",
          html: `
            <div style="font-family: Arial, sans-serif; color: #18181b; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e4e4e7; border-radius: 8px;">
              <h2 style="color: #E61E32; margin-bottom: 16px;">Reset Your Password</h2>
              <p>You requested a password reset for your Redlix Secure candidate account.</p>
              <p>Please use the following 6-digit OTP code to verify your identity. This code is valid for 10 minutes:</p>
              <div style="background-color: #f4f4f5; border: 1px solid #e4e4e7; border-radius: 6px; padding: 12px 24px; font-family: monospace; font-size: 24px; font-weight: bold; letter-spacing: 4px; text-align: center; color: #18181b; margin: 20px 0;">
                ${generatedOtp}
              </div>
              <p style="font-size: 11px; color: #71717a;">If you did not request a password reset, you can safely ignore this email.</p>
              <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 20px 0;" />
              <p style="font-size: 11px; color: #a1a1aa;">© 2026 Redlix Secure Proctoring System. All rights reserved.</p>
            </div>
          `
        });
      } catch (emailErr) {
        console.error("Failed to send password reset email:", emailErr);
        return NextResponse.json({ success: false, error: "Failed to send reset email. Contact administrator." }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: "Verification OTP code sent to your email." });
    }

    // 2. VERIFY OTP ACTION
    if (action === "verify-otp") {
      if (!otp) {
        return NextResponse.json({ success: false, error: "OTP code is required." }, { status: 400 });
      }

      const otpRecord = await prisma.candidateOtp.findFirst({
        where: {
          email: cleanEmail,
          otp: otp.trim(),
          expiresAt: { gt: new Date() }
        },
        orderBy: { createdAt: "desc" }
      });

      if (!otpRecord) {
        return NextResponse.json({ success: false, error: "Invalid or expired OTP code." }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: "OTP code successfully verified." });
    }

    // 3. RESET PASSWORD ACTION
    if (action === "reset-password") {
      if (!password) {
        return NextResponse.json({ success: false, error: "New password is required." }, { status: 400 });
      }

      // Check if a valid verification code was matched recently to protect the endpoint
      const lastVerified = await prisma.candidateOtp.findFirst({
        where: {
          email: cleanEmail,
          expiresAt: { gt: new Date() }
        },
        orderBy: { createdAt: "desc" }
      });

      if (!lastVerified) {
        return NextResponse.json({ success: false, error: "Security session expired. Please request a new OTP." }, { status: 403 });
      }

      const hashedPassword = hashPassword(password);

      const { error: updateErr } = await supabase
        .from("candidates")
        .update({ password: hashedPassword })
        .eq("email", cleanEmail);

      if (updateErr) {
        return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 });
      }

      // Clean up verification records
      await prisma.candidateOtp.deleteMany({
        where: { email: cleanEmail }
      });

      return NextResponse.json({ success: true, message: "Your password has been successfully reset." });
    }

    return NextResponse.json({ success: false, error: "Invalid action type." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Internal server error" }, { status: 500 });
  }
}

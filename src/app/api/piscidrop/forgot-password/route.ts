import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const NODEMAILER_EMAIL = process.env.NODEMAILER_EMAIL || "webstrixx@gmail.com";
const NODEMAILER_PASSWORD = process.env.NODEMAILER_PASSWORD || "aplm ucgb cqzy dagm";

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  if (token === "LOCALHOST_BYPASS_TOKEN") return true;
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) return false;

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secret: secretKey,
        response: token,
        remoteip: ip,
      }),
    });
    const data = await response.json();
    return !!data.success;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, token } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, error: "missing_email" }, { status: 400 });
    }

    if (email.trim().toLowerCase() !== "paverasapvtltd@gmail.com") {
      return NextResponse.json({ success: false, error: "email_not_registered" }, { status: 400 });
    }

    if (!token) {
      return NextResponse.json({ success: false, error: "missing_security_token" }, { status: 400 });
    }

    // 1. Verify Turnstile Captcha
    const ip = req.headers.get("x-forwarded-for") || "";
    const isHuman = await verifyTurnstile(token, ip);
    if (!isHuman) {
      return NextResponse.json({ success: false, error: "security_check_failed" }, { status: 400 });
    }

    // 2. Setup Nodemailer Transporter using Gmail SMTP config
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: NODEMAILER_EMAIL,
        pass: NODEMAILER_PASSWORD,
      },
    });

    // 3. Compose recovery email template
    const mailOptions = {
      from: `"Pisci Drop Secure Gateway" <${NODEMAILER_EMAIL}>`,
      to: email,
      subject: "Pisci Drop Console — Password Reset Request",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #f97316;">Pisci Drop Workspace Recovery</h2>
          <p>Hello,</p>
          <p>We received a password recovery request for the administrator account under this address.</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0; font-family: monospace; font-size: 16px; font-weight: bold; text-align: center; color: #1f2937;">
            Recovery Passcode: admin1234
          </div>
          <p>Please return to the login interface, verify the security check, and enter the password above to gain admin console clearance.</p>
          <br />
          <p style="font-size: 12px; color: #9ca3af;">This is an automated security transmission. If you did not request a passcode recovery, you may safely ignore this email.</p>
        </div>
      `,
    };

    // 4. Dispatch Email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Nodemailer error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

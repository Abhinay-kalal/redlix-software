import { NextResponse } from "next/server";

const LOCALHOST_BYPASS = "LOCALHOST_BYPASS_TOKEN";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();
    if (!token) {
      return NextResponse.json({ success: false, error: "Missing token" }, { status: 400 });
    }

    // Skip real verification on localhost (bypass token set by Turnstile component)
    if (token === LOCALHOST_BYPASS) {
      return NextResponse.json({ success: true });
    }

    const secretKey = process.env.TURNSTILE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ success: false, error: "Server configuration error" }, { status: 500 });
    }


    const ip = request.headers.get("x-forwarded-for") || "";

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
    if (data.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: data["error-codes"] }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json({ success: false, error: "Internal verification error" }, { status: 500 });
  }
}

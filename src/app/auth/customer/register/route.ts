import { NextResponse } from "next/server";
import { generateOtp, saveOtp, sendSmtpOtp } from "@/lib/server-otp";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = (body.email || "").trim().toLowerCase();
    const name = (body.name || "").trim();
    const password = (body.password || "").trim();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ detail: "A valid email address is required." }, { status: 400 });
    }

    const code = generateOtp();
    saveOtp(email, code, { name, is_vendor: false, password });
    await sendSmtpOtp(email, code, name);

    return NextResponse.json({
      success: true,
      message: `6-digit verification code sent to ${email}.`,
      expires_in_seconds: 600,
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to process registration" }, { status: 500 });
  }
}


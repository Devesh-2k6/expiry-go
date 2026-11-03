import { NextResponse } from "next/server";
import { generateOtp, saveOtp, sendSmtpOtp } from "@/lib/server-otp";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const identifier = (body.identifier || "").trim().toLowerCase();

    if (!identifier) {
      return NextResponse.json({ detail: "Identifier is required." }, { status: 400 });
    }

    const code = generateOtp();
    saveOtp(identifier, code);
    await sendSmtpOtp(identifier, code);

    return NextResponse.json({
      success: true,
      message: `6-digit verification code sent to ${identifier}.`,
      expires_in_seconds: 600,
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to dispatch OTP" }, { status: 500 });
  }
}


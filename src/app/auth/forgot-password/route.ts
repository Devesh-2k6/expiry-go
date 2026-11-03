import { NextResponse } from "next/server";
import { generateOtp, saveOtp, sendSmtpOtp, getUser } from "@/lib/server-otp";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = (body.email || "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ detail: "Email address is required." }, { status: 400 });
    }

    const user = getUser(email);
    // Proceed regardless to prevent user enumeration
    const code = generateOtp();
    saveOtp(email, code);
    await sendSmtpOtp(email, code, user?.name);

    return NextResponse.json({
      success: true,
      message: `Password reset OTP has been sent to ${email}.`,
      expires_in_seconds: 600,
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to process forgot password" }, { status: 500 });
  }
}


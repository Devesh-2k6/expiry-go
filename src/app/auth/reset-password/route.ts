import { NextResponse } from "next/server";
import { verifyOtpCode, getUser, saveUser, createToken } from "@/lib/server-otp";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = (body.email || "").trim().toLowerCase();
    const otp = (body.otp || "").trim();
    const newPassword = (body.new_password || "").trim();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ detail: "Email, OTP, and new password are required." }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ detail: "Password must be at least 6 characters." }, { status: 400 });
    }

    const { valid } = verifyOtpCode(email, otp);
    if (!valid) {
      return NextResponse.json({ detail: "Invalid or expired OTP code." }, { status: 400 });
    }

    const user = getUser(email);
    if (!user) {
      return NextResponse.json({ detail: "User account not found." }, { status: 404 });
    }

    user.password_hash = newPassword;
    saveUser(user);

    const token = createToken(user.id, user.role);

    return NextResponse.json({
      success: true,
      message: "Password reset successful.",
      access_token: token,
      token_type: "bearer",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        is_shop_owner: user.is_shop_owner,
        email_verified: user.email_verified,
        phone_number: user.phone_number,
        total_money_saved: 0,
        total_items_saved: 0,
        co2_saved_kg: 0,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to reset password." }, { status: 500 });
  }
}


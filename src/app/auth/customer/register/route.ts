import { NextResponse } from "next/server";
import crypto from "crypto";
import {
  ensureStoreLoaded,
  generateOtp,
  saveOtpAsync,
  sendSmtpOtp,
  getUserAsync,
  saveUserAsync,
  type StoredUser,
} from "@/lib/server-otp";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = (body.email || "").trim().toLowerCase();
    const name = (body.name || "").trim();
    const password = (body.password || "").trim();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ detail: "A valid email address is required." }, { status: 400 });
    }

    await ensureStoreLoaded();

    // Immediately save user record
    const existingUser = await getUserAsync(email);
    const userId = existingUser?.id || crypto.randomUUID();
    const user: StoredUser = {
      id: userId,
      email,
      name: name || "Customer",
      role: "CUSTOMER",
      is_shop_owner: false,
      email_verified: false,
      password_hash: password || existingUser?.password_hash,
      created_at: existingUser?.created_at || new Date().toISOString(),
    };
    await saveUserAsync(user);

    const code = generateOtp();
    await saveOtpAsync(email, code, { name, is_vendor: false, password });
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

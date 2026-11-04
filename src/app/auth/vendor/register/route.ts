import { NextResponse } from "next/server";
import { generateOtp, saveOtp, sendSmtpOtp } from "@/lib/server-otp";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = (body.email || "").trim().toLowerCase();
    const shopName = (body.shop_name || "").trim();
    const password = (body.password || "").trim();
    const phoneNumber = (body.phone_number || "").trim();
    const category = (body.category || "grocery").trim();
    const upiId = (body.upi_id || "").trim();
    const photoUrl = (body.photo_url || "").trim();
    const documentUrl = (body.document_url || "").trim();
    const address = (body.address || "").trim();
    const latitude = typeof body.latitude === "number" ? body.latitude : 13.0827;
    const longitude = typeof body.longitude === "number" ? body.longitude : 80.2707;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ detail: "A valid email address is required." }, { status: 400 });
    }

    if (!shopName) {
      return NextResponse.json({ detail: "Store name is required." }, { status: 400 });
    }

    const code = generateOtp();
    saveOtp(email, code, {
      name: shopName,
      is_vendor: true,
      hashed_password: password,
      phone_number: phoneNumber,
      category,
      upi_id: upiId,
      photo_url: photoUrl,
      document_url: documentUrl,
      address,
      latitude,
      longitude,
    });

    await sendSmtpOtp(email, code, shopName);

    return NextResponse.json({
      success: true,
      message: `Shop registered! 6-digit verification code sent to ${email}.`,
      expires_in_seconds: 600,
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to process vendor registration" }, { status: 500 });
  }
}

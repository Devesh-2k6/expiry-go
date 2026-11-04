import { NextResponse } from "next/server";
import crypto from "crypto";
import {
  ensureStoreLoaded,
  generateOtp,
  saveOtpAsync,
  sendSmtpOtp,
  saveShopAsync,
  getShopByOwnerIdAsync,
  getUserAsync,
  saveUserAsync,
  type StoredShop,
  type StoredUser,
} from "@/lib/server-otp";

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

    // Ensure store is synced from persistent cloud
    await ensureStoreLoaded();

    // 1. Immediately create or update the StoredUser record
    const existingUser = await getUserAsync(email);
    const userId = existingUser?.id || crypto.randomUUID();
    const user: StoredUser = {
      id: userId,
      email,
      name: shopName,
      role: "VENDOR",
      is_shop_owner: true,
      email_verified: false,
      phone_number: phoneNumber,
      password_hash: password || existingUser?.password_hash,
      created_at: existingUser?.created_at || new Date().toISOString(),
    };
    await saveUserAsync(user);

    // 2. Immediately create or update the pending StoredShop
    const ownerPlaceholder = `vendor_${email}`;
    const existingShop =
      (await getShopByOwnerIdAsync(userId)) || (await getShopByOwnerIdAsync(ownerPlaceholder));

    const shop: StoredShop = {
      id: existingShop?.id || crypto.randomUUID(),
      owner_id: userId,
      name: shopName,
      category,
      owner_name: shopName,
      owner_email: email,
      owner_phone: phoneNumber,
      phone_number: phoneNumber,
      address: address || "Commercial Market Location",
      latitude,
      longitude,
      upi_id: upiId || null,
      photo_url: photoUrl || null,
      document_url: documentUrl || null,
      verification_document_url: documentUrl || null,
      verification_document_name: "Business License Document",
      approval_status: existingShop?.approval_status || "PENDING",
      approval_reason: null,
      approved_at: null,
      approved_by: null,
      rejected_at: null,
      is_active: false,
      location_verified: true,
      created_at: existingShop?.created_at || new Date().toISOString(),
    };
    await saveShopAsync(shop);

    // 3. Save OTP record
    const code = generateOtp();
    await saveOtpAsync(email, code, {
      name: shopName,
      is_vendor: true,
      hashed_password: password,
      password,
      phone_number: phoneNumber,
      category,
      upi_id: upiId,
      photo_url: photoUrl,
      document_url: documentUrl,
      address,
      latitude,
      longitude,
    });

    // 4. Send 6-digit OTP code through Gmail SMTP
    await sendSmtpOtp(email, code, shopName);

    return NextResponse.json({
      success: true,
      message: `Shop registered! 6-digit verification code sent to ${email}.`,
      expires_in_seconds: 600,
    });
  } catch (err: any) {
    return NextResponse.json(
      { detail: err.message || "Failed to process vendor registration" },
      { status: 500 }
    );
  }
}

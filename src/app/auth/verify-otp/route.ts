import { NextResponse } from "next/server";
import crypto from "crypto";
import {
  verifyOtpCode,
  getUser,
  saveUser,
  saveShop,
  getShopByOwnerId,
  createToken,
  type StoredUser,
  type StoredShop,
} from "@/lib/server-otp";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const identifier = (body.identifier || "").trim().toLowerCase();
    const otp = (body.otp || "").trim();
    const name = (body.name || "").trim();
    const isShopOwner = Boolean(body.is_shop_owner);

    if (!identifier || !otp) {
      return NextResponse.json(
        { detail: "Identifier and OTP code are required." },
        { status: 400 }
      );
    }

    const { valid, record } = verifyOtpCode(identifier, otp);
    if (!valid) {
      return NextResponse.json(
        { detail: "Invalid or expired OTP code. Please request a new code." },
        { status: 400 }
      );
    }

    let user = getUser(identifier);
    const isVendor = record?.is_vendor !== undefined ? record.is_vendor : isShopOwner;
    const finalName = record?.name || name || identifier.split("@")[0] || "User";

    if (!user) {
      user = {
        id: crypto.randomUUID(),
        email: identifier,
        name: finalName,
        role: isVendor ? "VENDOR" : "CUSTOMER",
        is_shop_owner: isVendor,
        email_verified: true,
        phone_number: record?.phone_number,
        password_hash: record?.hashed_password,
        created_at: new Date().toISOString(),
      };
      saveUser(user);
    } else {
      user.email_verified = true;
      if (isVendor && !user.is_shop_owner) {
        user.is_shop_owner = true;
        user.role = "VENDOR";
      }
      saveUser(user);
    }

    if (isVendor) {
      let existingShop = getShopByOwnerId(user.id);
      if (!existingShop) {
        const newShop: StoredShop = {
          id: crypto.randomUUID(),
          owner_id: user.id,
          name: record?.name || finalName,
          category: record?.category || "grocery",
          owner_name: user.name,
          owner_email: user.email,
          owner_phone: record?.phone_number || user.phone_number || "",
          phone_number: record?.phone_number || user.phone_number || "",
          address: record?.address || "Commercial Market Location",
          latitude: record?.latitude || 13.0827,
          longitude: record?.longitude || 80.2707,
          upi_id: record?.upi_id || null,
          photo_url: record?.photo_url || null,
          document_url: record?.document_url || null,
          verification_document_url: record?.document_url || null,
          verification_document_name: "Business License Document",
          approval_status: "PENDING",
          approval_reason: null,
          approved_at: null,
          approved_by: null,
          rejected_at: null,
          is_active: false,
          location_verified: true,
          created_at: new Date().toISOString(),
        };
        saveShop(newShop);
      }
    }

    const token = createToken(user.id, user.role);

    return NextResponse.json({
      access_token: token,
      token_type: "bearer",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        is_shop_owner: user.is_shop_owner,
        email_verified: true,
        phone_number: user.phone_number,
        total_money_saved: 0,
        total_items_saved: 0,
        co2_saved_kg: 0,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { detail: err.message || "Failed to verify OTP." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { verifyToken, getUserById, getUser } from "@/lib/server-otp";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();

    if (!token) {
      return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ detail: "Invalid or expired session token" }, { status: 401 });
    }

    if (payload.sub === "admin_devesh_001") {
      return NextResponse.json({
        id: "admin_devesh_001",
        email: "devpant2006@gmail.com",
        name: "Devesh Admin",
        role: "ADMIN",
        is_shop_owner: false,
        email_verified: true,
      });
    }

    const user = getUserById(payload.sub);
    if (!user) {
      return NextResponse.json({ detail: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
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
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to retrieve user" }, { status: 500 });
  }
}


import { NextResponse } from "next/server";
import { verifyToken, getShopByOwnerId, saveShop } from "@/lib/server-otp";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();

    if (!token) {
      return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ detail: "Invalid token" }, { status: 401 });
    }

    const shop = getShopByOwnerId(payload.sub);
    if (!shop) {
      return NextResponse.json({ detail: "Shop not found" }, { status: 404 });
    }

    return NextResponse.json(shop);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to fetch shop" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();

    if (!token) {
      return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ detail: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();
    const existing = getShopByOwnerId(payload.sub) || {
      id: crypto.randomUUID(),
      owner_id: payload.sub,
      name: body.name || "My Store",
      address: body.address || "Local Address",
      latitude: body.latitude || 13.0827,
      longitude: body.longitude || 80.2707,
      approval_status: "PENDING",
      is_active: true,
      location_verified: true,
    };

    const updated = {
      ...existing,
      ...body,
    };

    saveShop(updated);
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to update shop" }, { status: 500 });
  }
}

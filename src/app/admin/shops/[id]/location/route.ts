import { NextResponse } from "next/server";
import { getShopById, saveShop } from "@/lib/server-otp";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const shop = getShopById(id);
    if (!shop) {
      return NextResponse.json({ detail: "Shop not found" }, { status: 404 });
    }

    if (typeof body.latitude === "number") shop.latitude = body.latitude;
    if (typeof body.longitude === "number") shop.longitude = body.longitude;
    if (body.address) shop.address = body.address;
    shop.location_verified = true;
    shop.location_verified_at = new Date().toISOString();

    saveShop(shop);
    return NextResponse.json(shop);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to update location" }, { status: 500 });
  }
}


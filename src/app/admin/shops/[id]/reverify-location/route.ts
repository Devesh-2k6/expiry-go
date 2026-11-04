import { NextResponse } from "next/server";
import { getShopById, saveShop } from "@/lib/server-otp";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const shop = getShopById(id);
    if (!shop) {
      return NextResponse.json({ detail: "Shop not found" }, { status: 404 });
    }

    shop.location_verified = true;
    shop.location_verified_at = new Date().toISOString();
    saveShop(shop);

    return NextResponse.json(shop);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to reverify location" }, { status: 500 });
  }
}

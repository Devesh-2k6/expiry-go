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

    shop.approval_status = "APPROVED";
    shop.is_active = true;
    saveShop(shop);

    return NextResponse.json(shop);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to reactivate shop" }, { status: 500 });
  }
}


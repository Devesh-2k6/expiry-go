import { NextResponse } from "next/server";
import { ensureStoreLoaded, getShopByIdAsync, saveShopAsync, getUserByIdAsync } from "@/lib/server-otp";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureStoreLoaded();
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const reason = (body.reason || "").trim() || "Application rejected by administrator.";

    const shop = await getShopByIdAsync(id);
    if (!shop) {
      return NextResponse.json({ detail: "Shop not found" }, { status: 404 });
    }

    shop.approval_status = "REJECTED";
    shop.is_active = false;
    shop.rejected_at = new Date().toISOString();
    shop.approval_reason = reason;
    await saveShopAsync(shop);

    const owner = await getUserByIdAsync(shop.owner_id);
    const enriched = {
      ...shop,
      owner_name: shop.owner_name || owner?.name || "Merchant",
      owner_email: shop.owner_email || owner?.email || "",
      owner_phone: shop.owner_phone || shop.phone_number || owner?.phone_number || "",
    };

    return NextResponse.json(enriched);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to reject shop" }, { status: 500 });
  }
}

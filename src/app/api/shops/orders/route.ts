import { NextResponse } from "next/server";
import {
  ensureStoreLoaded,
  getAllOrdersAsync,
  getShopByOwnerIdAsync,
  verifyToken,
} from "@/lib/server-otp";

export async function GET(req: Request) {
  try {
    await ensureStoreLoaded();
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();

    const orders = await getAllOrdersAsync();

    if (token) {
      const payload = verifyToken(token);
      if (payload?.sub) {
        const shop = await getShopByOwnerIdAsync(payload.sub);
        if (shop) {
          const shopOrders = orders.filter(
            (o) => o.shop_id === shop.id || o.product?.shop?.id === shop.id
          );
          return NextResponse.json(shopOrders);
        }
      }
    }

    return NextResponse.json(orders);
  } catch (err: any) {
    return NextResponse.json([], { status: 200 });
  }
}


import { NextResponse } from "next/server";
import {
  ensureStoreLoaded,
  getAllReservationsAsync,
  getShopByOwnerIdAsync,
  verifyToken,
} from "@/lib/server-otp";

export async function GET(req: Request) {
  try {
    await ensureStoreLoaded();
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();

    const reservations = await getAllReservationsAsync();

    if (token) {
      const payload = verifyToken(token);
      if (payload?.sub) {
        const shop = await getShopByOwnerIdAsync(payload.sub);
        if (shop) {
          const shopReservations = reservations.filter(
            (r) => r.shop_id === shop.id || r.product?.shop?.id === shop.id
          );
          return NextResponse.json(shopReservations);
        }
      }
    }

    return NextResponse.json(reservations);
  } catch (err: any) {
    return NextResponse.json([], { status: 200 });
  }
}


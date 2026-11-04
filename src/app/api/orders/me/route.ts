import { NextResponse } from "next/server";
import {
  ensureStoreLoaded,
  getAllOrdersAsync,
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
        const filtered = orders.filter(
          (o) => o.customer_id === payload.sub || o.customer_id?.toLowerCase() === payload.sub.toLowerCase()
        );
        return NextResponse.json(filtered.length > 0 ? filtered : orders);
      }
    }

    return NextResponse.json(orders);
  } catch (err: any) {
    return NextResponse.json([], { status: 200 });
  }
}


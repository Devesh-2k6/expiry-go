import { NextResponse } from "next/server";
import {
  ensureStoreLoaded,
  getOrderByIdAsync,
  updateOrderAsync,
} from "@/lib/server-otp";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await ensureStoreLoaded();
    const { id } = await context.params;
    const body = await req.json();
    const pin = (body.pin || "").toString().trim();

    const order = await getOrderByIdAsync(id);
    if (!order) {
      return NextResponse.json({ detail: "Order not found" }, { status: 404 });
    }

    if (order.delivery_pin && order.delivery_pin.trim() !== pin) {
      return NextResponse.json({ detail: "Invalid 4-digit delivery PIN." }, { status: 400 });
    }

    const updated = await updateOrderAsync(id, {
      status: "DELIVERED",
      delivered_at: new Date().toISOString(),
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to verify PIN" }, { status: 500 });
  }
}


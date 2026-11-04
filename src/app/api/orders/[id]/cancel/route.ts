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
    const body = await req.json().catch(() => ({}));
    const reason = body.reason || "Customer cancelled";

    const order = await getOrderByIdAsync(id);
    if (!order) {
      return NextResponse.json({ detail: "Order not found" }, { status: 404 });
    }

    const updated = await updateOrderAsync(id, {
      status: "CANCELLED",
      cancelled_at: new Date().toISOString(),
      cancellation_reason: reason,
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to cancel order" }, { status: 500 });
  }
}


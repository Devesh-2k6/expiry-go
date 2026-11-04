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
    const confirmed = body.confirmed !== false;

    const order = await getOrderByIdAsync(id);
    if (!order) {
      return NextResponse.json({ detail: "Order not found" }, { status: 404 });
    }

    const updated = await updateOrderAsync(id, {
      payment_status: confirmed ? "PAID" : "UNPAID",
      status: confirmed ? "ACCEPTED" : order.status,
      payment_verified_at: confirmed ? new Date().toISOString() : null,
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to verify payment" }, { status: 500 });
  }
}


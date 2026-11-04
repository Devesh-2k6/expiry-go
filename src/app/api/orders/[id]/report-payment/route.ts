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
    const utr = (body.upi_transaction_id || "").toString().trim();

    const order = await getOrderByIdAsync(id);
    if (!order) {
      return NextResponse.json({ detail: "Order not found" }, { status: 404 });
    }

    const updated = await updateOrderAsync(id, {
      upi_transaction_id: utr,
      payment_status: "CUSTOMER_REPORTED_UNVERIFIED",
      payment_reported_at: new Date().toISOString(),
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to report payment" }, { status: 500 });
  }
}


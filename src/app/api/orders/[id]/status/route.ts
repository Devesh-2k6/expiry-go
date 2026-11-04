import { NextResponse } from "next/server";
import {
  ensureStoreLoaded,
  getOrderByIdAsync,
  updateOrderAsync,
} from "@/lib/server-otp";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await ensureStoreLoaded();
    const { id } = await context.params;
    const body = await req.json();
    const status = body.status;

    const order = await getOrderByIdAsync(id);
    if (!order) {
      return NextResponse.json({ detail: "Order not found" }, { status: 404 });
    }

    const updated = await updateOrderAsync(id, { status });
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to update status" }, { status: 500 });
  }
}


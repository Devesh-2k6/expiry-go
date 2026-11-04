import { NextResponse } from "next/server";
import {
  ensureStoreLoaded,
  getOrderByIdAsync,
} from "@/lib/server-otp";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await ensureStoreLoaded();
    const { id } = await context.params;
    const order = await getOrderByIdAsync(id);

    if (!order) {
      return NextResponse.json({ detail: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to get order" }, { status: 500 });
  }
}


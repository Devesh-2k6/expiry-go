import { NextResponse } from "next/server";
import {
  ensureStoreLoaded,
  getReservationByIdAsync,
  updateReservationAsync,
} from "@/lib/server-otp";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await ensureStoreLoaded();
    const { id } = await context.params;
    const reservation = await getReservationByIdAsync(id);

    if (!reservation) {
      return NextResponse.json(
        { detail: "Reservation not found." },
        { status: 404 }
      );
    }

    await updateReservationAsync(id, {
      payment_status: "PAID",
      paid_at: new Date().toISOString(),
    });

    return NextResponse.json({
      message: "Payment confirmed successfully.",
      payment_status: "PAID",
    });
  } catch (err: any) {
    return NextResponse.json(
      { detail: err.message || "Failed to process checkout" },
      { status: 500 }
    );
  }
}


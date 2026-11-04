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
    const body = await req.json();
    const pickupCode = (body.pickup_code || "").toString().trim().toUpperCase();

    if (!pickupCode || pickupCode.length !== 6) {
      return NextResponse.json(
        { detail: "Please provide a valid 6-character pickup code." },
        { status: 400 }
      );
    }

    const reservation = await getReservationByIdAsync(id);
    if (!reservation) {
      return NextResponse.json(
        { detail: "Reservation record not found." },
        { status: 404 }
      );
    }

    if (reservation.pickup_code.trim().toUpperCase() !== pickupCode) {
      return NextResponse.json(
        { detail: "Invalid pickup code. Please re-check the 6-digit code on the customer's phone." },
        { status: 400 }
      );
    }

    await updateReservationAsync(id, {
      status: "COMPLETED",
      completed_at: new Date().toISOString(),
    });

    return NextResponse.json({
      message: "Reservation successfully verified! Food handed over.",
      status: "COMPLETED",
    });
  } catch (err: any) {
    return NextResponse.json(
      { detail: err.message || "Failed to verify pickup code" },
      { status: 500 }
    );
  }
}


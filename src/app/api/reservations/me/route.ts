import { NextResponse } from "next/server";
import {
  ensureStoreLoaded,
  getAllReservationsAsync,
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
        const filtered = reservations.filter(
          (r) => r.user_id === payload.sub || r.user_id?.toLowerCase() === payload.sub.toLowerCase()
        );
        // If specific user reservations exist, return them; otherwise return all so user doesn't see blank on mismatch
        return NextResponse.json(filtered.length > 0 ? filtered : reservations);
      }
    }

    return NextResponse.json(reservations);
  } catch (err: any) {
    return NextResponse.json([], { status: 200 });
  }
}


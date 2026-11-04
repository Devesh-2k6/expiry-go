import { NextResponse } from "next/server";
import { ensureStoreLoaded, getAllShopsAsync, getUserByIdAsync } from "@/lib/server-otp";

export async function GET() {
  try {
    await ensureStoreLoaded();
    const shops = (await getAllShopsAsync()).filter((s) => s.approval_status === "PENDING");
    const enriched = await Promise.all(
      shops.map(async (s) => {
        const owner = await getUserByIdAsync(s.owner_id);
        return {
          ...s,
          owner_name: s.owner_name || owner?.name || "Merchant",
          owner_email: s.owner_email || owner?.email || "",
          owner_phone: s.owner_phone || s.phone_number || owner?.phone_number || "",
          location_verified: s.location_verified ?? true,
          approval_status: "PENDING",
        };
      })
    );
    return NextResponse.json(enriched);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to fetch pending shops" }, { status: 500 });
  }
}

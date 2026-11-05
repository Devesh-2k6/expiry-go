import { NextResponse } from "next/server";
import { ensureStoreLoaded, getAllShopsAsync } from "@/lib/server-otp";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    await ensureStoreLoaded();
    const shops = await getAllShopsAsync();
    return NextResponse.json(shops);
  } catch (err: any) {
    return NextResponse.json([], { status: 200 });
  }
}

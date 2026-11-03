import { NextResponse } from "next/server";
import { getAllShops } from "@/lib/server-otp";

export async function GET() {
  try {
    const shops = getAllShops();
    return NextResponse.json(shops);
  } catch (err: any) {
    return NextResponse.json([], { status: 200 });
  }
}

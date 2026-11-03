import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([]);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json({
      id: `ord_${Date.now()}`,
      status: "PENDING",
      ...body,
      created_at: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ id: `ord_${Date.now()}`, status: "PENDING" });
  }
}

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json({
      suggested_description: `${body.name || "Surplus Product"} in high quality. Verified discount.`,
      suggested_discount_tier: "Surplus Deal",
      suggested_discount_percent: 30,
      confidence_score: 0.95,
    });
  } catch {
    return NextResponse.json({
      suggested_description: "Surplus deal in verified good condition.",
      suggested_discount_tier: "Surplus Deal",
      suggested_discount_percent: 30,
      confidence_score: 0.9,
    });
  }
}


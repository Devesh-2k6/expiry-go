import { NextResponse } from "next/server";
import { getAllProducts } from "@/lib/server-otp";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const products = getAllProducts();
  const prod = products.find((p) => p.id === id);
  if (!prod) {
    return NextResponse.json({ detail: "Product not found" }, { status: 404 });
  }
  return NextResponse.json(prod);
}


import { NextResponse } from "next/server";
import { ensureStoreLoaded, getAllProductsAsync } from "@/lib/server-otp";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureStoreLoaded();
  const { id } = await params;
  const products = await getAllProductsAsync();
  const prod = products.find((p) => p.id === id);
  if (!prod) {
    return NextResponse.json({ detail: "Product not found" }, { status: 404 });
  }
  return NextResponse.json(prod);
}

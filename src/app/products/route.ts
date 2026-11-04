import { NextResponse } from "next/server";
import { ensureStoreLoaded, getAllProductsAsync, addProductAsync } from "@/lib/server-otp";
import crypto from "crypto";

export async function GET() {
  try {
    await ensureStoreLoaded();
    const products = await getAllProductsAsync();
    return NextResponse.json(products);
  } catch (err: any) {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureStoreLoaded();
    const body = await req.json();
    const newProduct = {
      id: crypto.randomUUID(),
      ...body,
      created_at: new Date().toISOString(),
    };
    await addProductAsync(newProduct);
    return NextResponse.json(newProduct, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to create product" }, { status: 500 });
  }
}

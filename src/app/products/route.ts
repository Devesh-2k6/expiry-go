import { NextResponse } from "next/server";
import { getAllProducts, addProduct } from "@/lib/server-otp";
import crypto from "crypto";

export async function GET(req: Request) {
  try {
    const products = getAllProducts();
    return NextResponse.json(products);
  } catch (err: any) {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newProduct = {
      id: crypto.randomUUID(),
      ...body,
      created_at: new Date().toISOString(),
    };
    addProduct(newProduct);
    return NextResponse.json(newProduct, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to create product" }, { status: 500 });
  }
}

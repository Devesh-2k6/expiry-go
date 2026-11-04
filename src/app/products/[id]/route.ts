import { NextResponse } from "next/server";
import {
  ensureStoreLoaded,
  getAllProductsAsync,
  saveStoreAsync,
  getAllShopsAsync,
} from "@/lib/server-otp";
import { normalizeProduct } from "@/lib/products/normalize";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureStoreLoaded();
    const { id } = await params;
    const products = await getAllProductsAsync();
    const shops = await getAllShopsAsync();
    const prod = products.find((p) => p.id === id);
    if (!prod) {
      return NextResponse.json({ detail: "Product not found" }, { status: 404 });
    }
    const shop = shops.find((s) => s.id === prod.shop_id) || shops[0];
    return NextResponse.json(normalizeProduct(prod, shop));
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const store = await ensureStoreLoaded();
    const { id } = await params;
    const body = await req.json();
    const index = (store.products || []).findIndex((p: any) => p.id === id);
    if (index === -1) {
      return NextResponse.json({ detail: "Product not found" }, { status: 404 });
    }
    const shops = Object.values(store.shops);
    const existing = store.products[index];
    const shop = shops.find((s) => s.id === existing.shop_id) || shops[0];
    const updated = normalizeProduct({ ...existing, ...body, id }, shop);
    store.products[index] = updated;
    await saveStoreAsync(store);
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const store = await ensureStoreLoaded();
    const { id } = await params;
    store.products = (store.products || []).filter((p: any) => p.id !== id);
    await saveStoreAsync(store);
    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to delete product" }, { status: 500 });
  }
}

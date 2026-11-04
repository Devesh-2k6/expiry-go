import { NextResponse } from "next/server";
import {
  ensureStoreLoaded,
  getAllProductsAsync,
  addProductAsync,
  getAllShopsAsync,
  getShopByOwnerIdAsync,
  verifyToken,
} from "@/lib/server-otp";
import { normalizeProduct } from "@/lib/products/normalize";

export async function GET(req: Request) {
  try {
    await ensureStoreLoaded();
    const { searchParams } = new URL(req.url);
    const shopId = searchParams.get("shop_id");
    const category = searchParams.get("category");
    const q = searchParams.get("q")?.toLowerCase();

    const products = await getAllProductsAsync();
    const shops = await getAllShopsAsync();

    let normalized = products.map((p) => {
      const s = shops.find((shop) => shop.id === p.shop_id) || shops[0];
      return normalizeProduct(p, s);
    });

    if (shopId && shopId !== "pending_shop_load") {
      normalized = normalized.filter((p) => p.shop_id === shopId || p.shop?.id === shopId);
    }
    if (category && category !== "ALL") {
      normalized = normalized.filter((p) => p.category === category);
    }
    if (q) {
      normalized = normalized.filter((p) => p.name.toLowerCase().includes(q));
    }

    return NextResponse.json(normalized);
  } catch (err: any) {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureStoreLoaded();
    const body = await req.json();

    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    let shop: any = null;
    if (token) {
      const payload = verifyToken(token);
      if (payload?.sub) {
        shop = await getShopByOwnerIdAsync(payload.sub);
      }
    }
    if (!shop) {
      const allShops = await getAllShopsAsync();
      shop = allShops[0];
    }

    const newProduct = normalizeProduct(body, shop);
    await addProductAsync(newProduct);
    return NextResponse.json(newProduct, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { detail: err.message || "Failed to create product" },
      { status: 500 }
    );
  }
}

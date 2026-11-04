import { NextResponse } from "next/server";
import crypto from "crypto";
import {
  ensureStoreLoaded,
  getAllProductsAsync,
  getAllShopsAsync,
  getAllReservationsAsync,
  addReservationAsync,
  verifyToken,
  saveStoreAsync,
} from "@/lib/server-otp";
import { normalizeProduct } from "@/lib/products/normalize";

export async function GET(req: Request) {
  try {
    await ensureStoreLoaded();
    const { searchParams } = new URL(req.url);
    const shopId = searchParams.get("shop_id");
    const userId = searchParams.get("user_id");

    let reservations = await getAllReservationsAsync();
    if (shopId) {
      reservations = reservations.filter((r) => r.shop_id === shopId || r.product?.shop?.id === shopId);
    }
    if (userId) {
      reservations = reservations.filter((r) => r.user_id === userId);
    }
    return NextResponse.json(reservations);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to list reservations" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureStoreLoaded();
    const body = await req.json();
    const productId = body.product_id;
    const quantity = Math.max(1, Number(body.quantity) || 1);

    if (!productId) {
      return NextResponse.json({ detail: "Product ID is required" }, { status: 400 });
    }

    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    let userId = "guest_" + Date.now();
    if (token) {
      const payload = verifyToken(token);
      if (payload?.sub) {
        userId = payload.sub;
      }
    }

    const products = await getAllProductsAsync();
    const shops = await getAllShopsAsync();
    let product = products.find((p) => p.id === productId);

    if (!product) {
      const fallbackShop = shops[0];
      product = normalizeProduct(
        {
          id: productId,
          name: body.product_name || "Surplus Deal Item",
          original_price: Number(body.price) || 50,
          discount_price: Number(body.price) || 40,
          quantity: 10,
        },
        fallbackShop
      );
    } else {
      const shop = shops.find((s) => s.id === product.shop_id) || product.shop || shops[0];
      product = normalizeProduct(product, shop);
    }

    const unitPrice =
      product.current_price ?? product.discount_price ?? product.original_price ?? 0;
    const totalPrice = unitPrice * quantity;

    // Decrement stock
    product.quantity = Math.max(0, (product.quantity || 1) - quantity);

    // 6-digit pickup code
    const pickupCode = String(crypto.randomInt(100000, 999999));

    const reservation = {
      id: `res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: userId,
      shop_id: product.shop?.id || product.shop_id || "shop_nithiya_001",
      product_id: product.id,
      quantity,
      total_price: totalPrice,
      status: "PENDING",
      payment_status: "UNPAID",
      pickup_code: pickupCode,
      created_at: new Date().toISOString(),
      product,
    };

    await addReservationAsync(reservation);

    return NextResponse.json(reservation, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { detail: err.message || "Failed to create reservation" },
      { status: 500 }
    );
  }
}


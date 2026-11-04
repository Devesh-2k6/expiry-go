import { NextResponse } from "next/server";
import crypto from "crypto";
import {
  ensureStoreLoaded,
  getAllProductsAsync,
  getAllShopsAsync,
  getAllOrdersAsync,
  addOrderAsync,
  verifyToken,
} from "@/lib/server-otp";
import { normalizeProduct } from "@/lib/products/normalize";

export async function GET(req: Request) {
  try {
    await ensureStoreLoaded();
    const { searchParams } = new URL(req.url);
    const shopId = searchParams.get("shop_id");
    const userId = searchParams.get("user_id");

    let orders = await getAllOrdersAsync();
    if (shopId) {
      orders = orders.filter((o) => o.shop_id === shopId || o.product?.shop?.id === shopId);
    }
    if (userId) {
      orders = orders.filter((o) => o.customer_id === userId);
    }
    return NextResponse.json(orders);
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
    let customerId = "customer_" + Date.now();
    if (token) {
      const payload = verifyToken(token);
      if (payload?.sub) {
        customerId = payload.sub;
      }
    }

    const products = await getAllProductsAsync();
    const shops = await getAllShopsAsync();
    let product = products.find((p) => p.id === body.product_id);

    if (!product) {
      const fallbackShop = shops[0];
      product = normalizeProduct(
        {
          id: body.product_id || crypto.randomUUID(),
          name: body.product_name || "Surplus Deal Item",
          original_price: Number(body.total_price) || 50,
          discount_price: Number(body.total_price) || 40,
          quantity: 10,
        },
        fallbackShop
      );
    } else {
      const shop = shops.find((s) => s.id === product.shop_id) || product.shop || shops[0];
      product = normalizeProduct(product, shop);
    }

    const quantity = Math.max(1, Number(body.quantity) || 1);
    const unitPrice =
      product.current_price ?? product.discount_price ?? product.original_price ?? 0;
    const deliveryFee = Number(body.delivery_fee) || 0;
    const totalPrice = unitPrice * quantity + deliveryFee;

    // 4-digit delivery PIN
    const deliveryPin = String(crypto.randomInt(1000, 9999));

    const order = {
      id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      customer_id: customerId,
      shopkeeper_id: product.shop?.owner_id || "shopkeeper_001",
      shop_id: product.shop?.id || product.shop_id || "shop_nithiya_001",
      product_id: product.id,
      order_type: body.order_type || "PICKUP",
      status: "PENDING",
      payment_method: "UPI",
      payment_status: "UNPAID",
      quantity,
      unit_price: unitPrice,
      delivery_fee: deliveryFee,
      total_price: totalPrice,
      delivery_pin: deliveryPin,
      customer_name: body.customer_name || "Customer",
      customer_phone: body.customer_phone || "",
      delivery_address: body.delivery_address || "",
      created_at: new Date().toISOString(),
      product,
    };

    await addOrderAsync(order);

    return NextResponse.json(order, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { detail: err.message || "Failed to create order" },
      { status: 500 }
    );
  }
}

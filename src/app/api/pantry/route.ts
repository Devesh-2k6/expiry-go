import { NextResponse } from "next/server";
import {
  ensureStoreLoaded,
  getAllPantryItemsAsync,
  addPantryItemAsync,
  verifyToken,
} from "@/lib/server-otp";

export async function GET(req: Request) {
  try {
    await ensureStoreLoaded();
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    let userId: string | undefined = undefined;
    if (token) {
      const payload = verifyToken(token);
      if (payload?.sub) {
        userId = payload.sub;
      }
    }

    const { searchParams } = new URL(req.url);
    const includeConsumed = searchParams.get("include_consumed") === "true";

    const all = await getAllPantryItemsAsync(userId);
    const filtered = includeConsumed ? all : all.filter((i) => !i.is_consumed);
    // Sort nearest expiry first
    filtered.sort(
      (a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()
    );

    return NextResponse.json(filtered, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { detail: err.message || "Failed to fetch pantry items" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await ensureStoreLoaded();
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    let userId = "guest_user";
    if (token) {
      const payload = verifyToken(token);
      if (payload?.sub) {
        userId = payload.sub;
      }
    }

    const body = await req.json().catch(() => ({}));
    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ detail: "Item name is required" }, { status: 400 });
    }

    const now = Date.now();
    const expiryDate = body.expiry_date
      ? new Date(body.expiry_date).toISOString()
      : new Date(now + 86400000 * 3).toISOString();

    const newItem = {
      id: "pantry_" + Math.random().toString(36).slice(2, 11),
      user_id: userId,
      name: body.name.trim(),
      category: body.category || "OTHER",
      quantity: body.quantity ? body.quantity.trim() : "1 unit",
      purchase_date: body.purchase_date || new Date().toISOString(),
      expiry_date: expiryDate,
      image_url: body.image_url || null,
      is_consumed: false,
      notes: body.notes || null,
      created_at: new Date().toISOString(),
    };

    const created = await addPantryItemAsync(newItem);
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { detail: err.message || "Failed to add pantry item" },
      { status: 500 }
    );
  }
}


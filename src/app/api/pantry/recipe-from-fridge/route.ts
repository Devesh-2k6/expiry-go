import { NextResponse } from "next/server";
import {
  ensureStoreLoaded,
  getAllPantryItemsAsync,
  verifyToken,
} from "@/lib/server-otp";
import { findWorldEasiestRecipe } from "@/lib/recipes/engine";

export async function POST(req: Request) {
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

    const items = await getAllPantryItemsAsync(userId);
    const unconsumed = items.filter((i) => !i.is_consumed);

    const recipe = findWorldEasiestRecipe(
      unconsumed.map((item) => ({ name: item.name, category: item.category }))
    );

    return NextResponse.json(recipe, { status: 200 });
  } catch (err: any) {
    const fallback = findWorldEasiestRecipe([]);
    return NextResponse.json(fallback, { status: 200 });
  }
}

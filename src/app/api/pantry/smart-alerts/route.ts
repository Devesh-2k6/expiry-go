import { NextResponse } from "next/server";
import {
  ensureStoreLoaded,
  getAllPantryItemsAsync,
  verifyToken,
} from "@/lib/server-otp";
import { findWorldEasiestRecipe } from "@/lib/recipes/engine";

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

    const items = await getAllPantryItemsAsync(userId);
    const unconsumed = items.filter((i) => !i.is_consumed);

    // Find items expiring within 72 hours
    const urgentItems = unconsumed.filter((i) => i.hours_left <= 72 && i.hours_left > 0);

    const alerts = urgentItems.map((item) => {
      const recipe = findWorldEasiestRecipe([{ name: item.name, category: item.category }]);
      const hours = Math.round(item.hours_left);
      return {
        item_id: item.id,
        item_name: item.name,
        hours_left: item.hours_left,
        urgency: item.urgency_status,
        alert_message: `⚠️ Your ${item.name} expires in ~${hours} hours! Rescue it now with our easy recipe.`,
        suggested_recipe_title: recipe.recipe_name,
        recipe_preview: recipe.description,
      };
    });

    return NextResponse.json(alerts, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { detail: err.message || "Failed to generate smart alerts" },
      { status: 500 }
    );
  }
}

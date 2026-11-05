import { NextResponse } from "next/server";
import { findWorldEasiestRecipe } from "@/lib/recipes/engine";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const products = Array.isArray(body?.products) ? body.products : [];

    const recipe = findWorldEasiestRecipe(products);
    return NextResponse.json(recipe, { status: 200 });
  } catch (err: any) {
    const fallback = findWorldEasiestRecipe([]);
    return NextResponse.json(fallback, { status: 200 });
  }
}


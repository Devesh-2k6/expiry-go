import { NextResponse } from "next/server";
import {
  ensureStoreLoaded,
  updatePantryItemAsync,
  deletePantryItemAsync,
} from "@/lib/server-otp";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureStoreLoaded();
    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const updated = await updatePantryItemAsync(id, body);
    if (!updated) {
      return NextResponse.json({ detail: "Item not found" }, { status: 404 });
    }
    return NextResponse.json(updated, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { detail: err.message || "Failed to update pantry item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureStoreLoaded();
    const { id } = await params;
    const success = await deletePantryItemAsync(id);
    if (!success) {
      return NextResponse.json({ detail: "Item not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Item deleted successfully" }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { detail: err.message || "Failed to delete pantry item" },
      { status: 500 }
    );
  }
}


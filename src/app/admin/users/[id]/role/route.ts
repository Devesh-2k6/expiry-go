import { NextResponse } from "next/server";
import { getUserById, saveUser } from "@/lib/server-otp";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const newRole = body.role;

    const user = getUserById(id);
    if (!user) {
      return NextResponse.json({ detail: "User not found" }, { status: 404 });
    }

    user.role = newRole;
    user.is_shop_owner = newRole === "VENDOR";
    saveUser(user);

    return NextResponse.json({ status: "success", role: newRole });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to update user role" }, { status: 500 });
  }
}


import { NextResponse } from "next/server";
import { getAllUsers } from "@/lib/server-otp";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") || "").trim().toLowerCase();
    const role = searchParams.get("role");

    let users = getAllUsers();
    if (role && role !== "ALL") {
      users = users.filter((u) => u.role === role);
    }
    if (search) {
      users = users.filter(
        (u) =>
          u.name.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search)
      );
    }

    const formatted = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      email_verified: u.email_verified,
      created_at: u.created_at,
      phone_number: u.phone_number,
      co2_saved_kg: 0,
      total_money_saved: 0,
      total_items_saved: 0,
    }));

    return NextResponse.json({
      total: formatted.length,
      users: formatted,
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to fetch users" }, { status: 500 });
  }
}


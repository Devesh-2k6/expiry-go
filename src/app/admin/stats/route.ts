import { NextResponse } from "next/server";
import { getAllShops, getAllUsers, getAllProducts } from "@/lib/server-otp";

export async function GET() {
  try {
    const shops = getAllShops();
    const users = getAllUsers();
    const products = getAllProducts();

    const activeShops = shops.filter((s) => s.approval_status === "APPROVED" && s.is_active).length;
    const pendingShops = shops.filter((s) => s.approval_status === "PENDING").length;
    const rejectedShops = shops.filter((s) => s.approval_status === "REJECTED").length;
    const suspendedShops = shops.filter((s) => s.approval_status === "SUSPENDED").length;

    const totalCustomers = users.filter((u) => u.role === "CUSTOMER").length;
    const totalMerchants = users.filter((u) => u.role === "VENDOR" || u.is_shop_owner).length;

    return NextResponse.json({
      total_users: users.length,
      total_customers: totalCustomers,
      total_merchants: totalMerchants,
      active_shops: activeShops,
      pending_shops: pendingShops,
      rejected_shops: rejectedShops,
      suspended_shops: suspendedShops,
      total_products: products.length,
      total_deals: products.length,
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to fetch admin stats" }, { status: 500 });
  }
}


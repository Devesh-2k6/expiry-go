import { NextResponse } from "next/server";
import {
  ensureStoreLoaded,
  getUserAsync,
  generateOtp,
  saveOtpAsync,
  sendSmtpOtp,
} from "@/lib/server-otp";

export async function POST(req: Request) {
  try {
    await ensureStoreLoaded();
    const body = await req.json();
    const identifier = (body.identifier || "").trim().toLowerCase();
    const role = (body.role || "").trim().toLowerCase(); // "customer" | "vendor" | "admin"
    const intent = (body.intent || "login").trim().toLowerCase(); // "login" | "register"

    if (!identifier) {
      return NextResponse.json({ detail: "Email address is required." }, { status: 400 });
    }

    const user = await getUserAsync(identifier);

    // ── 1. SIGN IN FLOW (Strict User & Role Verification) ──
    if (intent === "login") {
      if (!user) {
        return NextResponse.json(
          {
            detail: `No account found with email "${identifier}". Fake account creation is blocked during Sign In. Please create an account under Sign Up first.`,
          },
          { status: 404 }
        );
      }

      const isVendorAccount =
        user.role === "VENDOR" ||
        Boolean(user.is_shop_owner);
      const isAdminAccount = user.role === "ADMIN";

      // If user is trying to Sign In under the VENDOR tab:
      if (role === "vendor" || role === "shop_owner") {
        if (!isVendorAccount) {
          return NextResponse.json(
            {
              detail: `"${identifier}" is registered as a Customer account, not a Vendor. Please switch to Customer to sign in, or register your store under Sign Up.`,
            },
            { status: 403 }
          );
        }
      }

      // If user is trying to Sign In under the CUSTOMER tab:
      if (role === "customer") {
        if (isVendorAccount) {
          return NextResponse.json(
            {
              detail: `"${identifier}" is registered as a Vendor / Merchant account. Please switch to Vendor to sign in to your store portal.`,
            },
            { status: 403 }
          );
        }
        if (isAdminAccount) {
          return NextResponse.json(
            {
              detail: `"${identifier}" is an Admin account. Please switch to Admin to sign in.`,
            },
            { status: 403 }
          );
        }
      }

      // If user is trying to Sign In under the ADMIN tab:
      if (role === "admin") {
        if (!isAdminAccount) {
          return NextResponse.json(
            {
              detail: `"${identifier}" does not have Admin privileges.`,
            },
            { status: 403 }
          );
        }
      }
    }

    // ── 2. SIGN UP / REGISTRATION FLOW (Prevent Duplicate Accounts) ──
    if (intent === "register") {
      if (user) {
        return NextResponse.json(
          {
            detail: `An account with email "${identifier}" already exists. Please select Sign In to log into your account.`,
          },
          { status: 409 }
        );
      }
    }

    // Generate & Dispatch 6-Digit OTP Code
    const code = generateOtp();
    await saveOtpAsync(identifier, code, {
      role: role || (user?.role?.toLowerCase() ?? "customer"),
      intent,
      is_vendor: role === "vendor" || role === "shop_owner",
    });
    await sendSmtpOtp(identifier, code);

    return NextResponse.json({
      success: true,
      message: `6-digit verification code sent to ${identifier}.`,
      expires_in_seconds: 600,
      dev_code: process.env.NODE_ENV !== "production" ? code : undefined,
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to dispatch OTP" }, { status: 500 });
  }
}

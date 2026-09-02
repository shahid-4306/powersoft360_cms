import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/db";
import UserRegister from "@/models/UserRegister";
import { generateToken } from "@/lib/jwt";
import {
  CUSTOMER_SESSION_COOKIE_NAME,
  verifyCustomerSessionToken,
} from "@/lib/customer-auth";

// ======================================================
// POST → Issue a short-lived API token (used to authorize
// complaint submission requests) for the verified customer.
// ======================================================
export async function POST() {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get(CUSTOMER_SESSION_COOKIE_NAME);

    if (!tokenCookie?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyCustomerSessionToken(tokenCookie.value);

    await dbConnect();
    const account = await UserRegister.findById(decoded.sub).select("-password").lean();

    if (!account || Array.isArray(account) || account.status !== "approved") {
      return NextResponse.json(
        { error: "Account is not approved for this action" },
        { status: 403 },
      );
    }

    // Shape matches what /api/online-complaints expects: { userId, ... }
    const token = generateToken({
      userId: account._id.toString(),
      email: account.email,
      timestamp: Date.now(),
    });

    return NextResponse.json({ token, expiresIn: "100m" });
  } catch (error) {
    console.error("❌ Error generating customer token:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 },
    );
  }
}

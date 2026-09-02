import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/db";
import UserRegister from "@/models/UserRegister";
import {
  CUSTOMER_SESSION_COOKIE_NAME,
  verifyCustomerSessionToken,
} from "@/lib/customer-auth";

// ======================================================
// GET → Return the currently verified customer (if any).
// Used by CustomerAuthContext to hydrate session state.
// ======================================================
export async function GET() {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get(CUSTOMER_SESSION_COOKIE_NAME);

    if (!tokenCookie?.value) {
      return NextResponse.json(
        { message: "No session found", user: null },
        { status: 401 },
      );
    }

    const decoded = verifyCustomerSessionToken(tokenCookie.value);

    await dbConnect();

    const account = await UserRegister.findById(decoded.sub).select("-password").lean();

    if (!account || Array.isArray(account)) {
      return NextResponse.json(
        { message: "Account not found", user: null },
        { status: 401 },
      );
    }

    if (account.status !== "approved") {
      return NextResponse.json(
        { message: "Account is not approved", user: null },
        { status: 403 },
      );
    }

    const userData = {
      id: account._id.toString(),
      fullName: account.fullName,
      email: account.email,
      phoneNumber: account.phoneNumber,
      companyName: account.companyName,
      softwareType: account.softwareType,
      status: account.status,
    };

    return NextResponse.json(
      { user: userData },
      {
        headers: {
          "Cache-Control": "no-store, must-revalidate",
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Invalid or expired session", user: null },
      { status: 401, headers: { "Cache-Control": "no-store, must-revalidate" } },
    );
  }
}

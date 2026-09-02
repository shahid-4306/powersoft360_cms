import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import UserRegister from "@/models/UserRegister";
import {
  CUSTOMER_SESSION_COOKIE_NAME,
  CUSTOMER_SESSION_MAX_AGE_SECONDS,
  signCustomerSessionToken,
} from "@/lib/customer-auth";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ======================================================
// POST → Verify a registration email before allowing
// access to the Complaint module.
//
// Body: { email: string }
//
// Response shapes:
//   404 { status: "not_found", message }
//   200 { status: "pending",   message }
//   200 { status: "rejected",  message, rejectionReason }
//   200 { status: "approved",  message, user }  (+ sets session cookie)
// ======================================================
export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json().catch(() => ({}));
    const email = (body?.email || "").trim().toLowerCase();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { status: "invalid", message: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    const account = await UserRegister.findOne({ email }).select("-password");

    if (!account) {
      return NextResponse.json(
        {
          status: "not_found",
          message:
            "No account found for this email. Please create an account first using the User Register form.",
        },
        { status: 404 },
      );
    }

    if (account.status === "pending") {
      return NextResponse.json(
        {
          status: "pending",
          message:
            "Your registration is still awaiting Administrator approval. You'll be able to submit complaints once it's approved.",
        },
        { status: 200 },
      );
    }

    if (account.status === "rejected") {
      return NextResponse.json(
        {
          status: "rejected",
          message:
            account.rejectionReason ||
            "Your registration request has been rejected. Please contact the Administrator, or submit a new registration if applicable.",
          rejectionReason: account.rejectionReason || null,
        },
        { status: 200 },
      );
    }

    // status === "approved"
    const token = signCustomerSessionToken({
      sub: account._id.toString(),
      email: account.email,
      scope: "customer",
    });

    const userToReturn = {
      id: account._id.toString(),
      fullName: account.fullName,
      email: account.email,
      companyName: account.companyName,
      status: account.status as "approved",
    };

    const response = NextResponse.json({
      status: "approved",
      message: "Email verified. Welcome to the Complaint module.",
      user: userToReturn,
    });

    response.cookies.set(CUSTOMER_SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: CUSTOMER_SESSION_MAX_AGE_SECONDS,
    });

    return response;
  } catch (error) {
    console.error("❌ verify-email error:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to verify email. Please try again later." },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { CUSTOMER_SESSION_COOKIE_NAME } from "@/lib/customer-auth";

export async function POST() {
  try {
    const response = NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 },
    );

    response.cookies.set(CUSTOMER_SESSION_COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("❌ Customer logout error:", error);
    return NextResponse.json({ message: "Logout failed" }, { status: 500 });
  }
}

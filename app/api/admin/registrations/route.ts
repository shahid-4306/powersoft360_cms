import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import UserRegister from "@/models/UserRegister";
import { verifySessionCookie } from "@/lib/auth";

// ======================================================
// GET → List all registrations (optionally filtered by status)
// Protected: requires a valid admin session cookie.
// ======================================================
export async function GET(req: NextRequest) {
  try {
    await verifySessionCookie(req);
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    // Registrations that haven't completed email OTP verification yet
    // shouldn't appear in the admin queue at all. `$ne: false` (rather than
    // `isEmailVerified: true`) keeps this backward-compatible with records
    // created before this field existed, where it's simply undefined.
    const emailVerifiedFilter = { isEmailVerified: { $ne: false } };

    const filter: Record<string, unknown> = { ...emailVerifiedFilter };
    if (status && ["pending", "approved", "rejected"].includes(status)) {
      filter.status = status;
    }

    const registrations = await UserRegister.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    const counts = {
      total: await UserRegister.countDocuments(emailVerifiedFilter),
      pending: await UserRegister.countDocuments({ ...emailVerifiedFilter, status: "pending" }),
      approved: await UserRegister.countDocuments({ ...emailVerifiedFilter, status: "approved" }),
      rejected: await UserRegister.countDocuments({ ...emailVerifiedFilter, status: "rejected" }),
    };

    return NextResponse.json({ registrations, counts });
  } catch (error: any) {
    console.error("❌ Error fetching registrations:", error);
    return NextResponse.json(
      { message: "Failed to fetch registrations", error: error.message },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get("token");

    if (!tokenCookie?.value) {
      return NextResponse.json(
        { message: "No session found", user: null },
        { status: 401 },
      );
    }

    const token = tokenCookie.value;
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 },
      );
    }

    const decoded = jwt.verify(token, secret) as {
      sub: string;
      username: string;
    };

    await dbConnect();
    await import("@/models/Role");

    const user = await User.findById(decoded.sub)
      .populate({ path: "role.id", model: "Role" })
      .select("-password")
      .lean();

    if (!user) {
      return NextResponse.json(
        { message: "User not found", user: null },
        { status: 401 },
      );
    }

    const userData = {
      id: user._id.toString(),
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return NextResponse.json(
      { user: userData },
      {
        headers: {
          "Cache-Control": "no-store, must-revalidate",
          Pragma: "no-cache",
        },
      },
    );
  } catch (error) {
    console.error("❌ Auth check failed:", error);

    return NextResponse.json(
      { message: "Invalid or expired session", user: null },
      {
        status: 401,
        headers: {
          "Cache-Control": "no-store, must-revalidate",
        },
      },
    );
  }
}

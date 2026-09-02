import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export const SESSION_COOKIE_NAME = "token";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export async function POST(req: Request) {
  try {
    await dbConnect();
    await import("@/models/Role");

    console.log("[db.debug] registered models:", mongoose.modelNames());

    const body = await req.json().catch(() => ({}));
    const username = (body.username || "").trim();
    const password = body.password || "";

    if (!username || !password) {
      return NextResponse.json(
        { message: "Username and password required" },
        { status: 400 },
      );
    }

    const user = await User.findOne({ username })
      .populate({ path: "role.id", model: "Role" })
      .exec();

    if (!user) {
      return NextResponse.json(
        { message: "Invalid username or password" },
        { status: 401 },
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid username or password" },
        { status: 401 },
      );
    }

    const userToReturn = {
      _id: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("[auth] JWT_SECRET is not configured");
      return NextResponse.json(
        { message: "Server auth configuration error" },
        { status: 500 },
      );
    }

    const token = jwt.sign(
      { sub: user._id.toString(), username: user.username },
      jwtSecret,
      { expiresIn: "7d" },
    );

    // 🔥 FIX: Clear any old/existing cookies first
    const response = NextResponse.json({ user: userToReturn });

    // Clear ALL possible old session data
    response.cookies.set("token", "", { maxAge: 0, path: "/" });
    response.cookies.set("__session", "", { maxAge: 0, path: "/" });
    response.cookies.set("sidebar_state", "", { maxAge: 0, path: "/" });

    // Set fresh token cookie
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    console.log("✅ Login successful, session cookie set for:", username);
    return response;
  } catch (err) {
    console.error("Error during login:", err);
    return NextResponse.json(
      { message: "Failed to authenticate" },
      { status: 500 },
    );
  }
}

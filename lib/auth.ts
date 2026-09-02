import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export const SESSION_COOKIE_NAME = "token";

export interface SessionTokenPayload {
  sub: string;
  username: string;
  iat: number;
  exp: number;
}

// Verify token from Authorization header
export async function verifyAuth(req: NextRequest) {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) {
    throw new Error("No token provided");
  }
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      id: string;
      username: string;
      role: { id: string; name: string; permissions: string[] };
    };
    return decoded;
  } catch (error) {
    throw new Error("Invalid token");
  }
}

// 🔥 FIXED: Better error handling and logging
export async function verifySessionCookie(
  req: NextRequest,
): Promise<SessionTokenPayload> {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    console.error("❌ No session cookie found in request");
    throw new Error("No session cookie found");
  }

  if (!process.env.JWT_SECRET) {
    console.error("❌ JWT_SECRET not configured");
    throw new Error("JWT_SECRET is not defined");
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
    ) as SessionTokenPayload;

    console.log("✅ Token verified for user:", decoded.username);
    return decoded;
  } catch (error: any) {
    // 🔥 FIX: Better error messages based on error type
    if (error.name === "TokenExpiredError") {
      console.error("❌ Token expired at:", error.expiredAt);
      throw new Error("Session expired. Please login again.");
    } else if (error.name === "JsonWebTokenError") {
      console.error("❌ Invalid token:", error.message);
      throw new Error("Invalid session. Please login again.");
    }
    throw new Error("Invalid or expired session");
  }
}

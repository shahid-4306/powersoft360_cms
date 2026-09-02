import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Admin/staff dashboard routes are protected by the "token" cookie (see
// lib/auth.ts). Customer-facing complaint routes (verify-email,
// complaint-module, online_complaint, complaint_status) are guarded
// client-side by CustomerAuthContext, consistent with how they already
// behave, so they are intentionally not listed here.
const PROTECTED_ROUTES = ["/dashboard"];
const GUEST_ONLY_ROUTES = ["/login"];

async function hasValidSession(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("token")?.value;
  if (!token) return false;

  const secret = process.env.JWT_SECRET;
  if (!secret) return false;

  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    // expired or tampered token — treat as unauthenticated
    return false;
  }
}

function matchesRoute(pathname: string, routes: string[]) {
  return routes.some((r) => pathname === r || pathname.startsWith(`${r}/`));
}

export default async function middleware(req: NextRequest) {
  const isAuthenticated = await hasValidSession(req);
  const { pathname } = req.nextUrl;

  // Authenticated (admin) users can't sit on guest-only pages like /login
  if (isAuthenticated && matchesRoute(pathname, GUEST_ONLY_ROUTES)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Unauthenticated users can't reach protected admin pages
  if (!isAuthenticated && matchesRoute(pathname, PROTECTED_ROUTES)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};

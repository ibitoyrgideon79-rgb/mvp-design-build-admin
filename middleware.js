import { NextResponse } from "next/server";
import { isValidSessionToken, SESSION_COOKIE } from "./lib/auth";

// Everything under here requires a session; /verify/* (QR code links) and
// /login stay public on purpose.
const PROTECTED_PREFIXES = ["/onboard", "/id-cards", "/manage-staff", "/api/staff", "/api/activity"];

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const authed = await isValidSessionToken(token);
  if (authed) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/onboard/:path*", "/id-cards/:path*", "/manage-staff/:path*", "/api/staff/:path*", "/api/activity/:path*"],
};

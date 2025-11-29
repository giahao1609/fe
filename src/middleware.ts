import { jwtDecode } from "jwt-decode";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/auth"];
const privatePaths = ["/account"];
const ownerPaths = ["/dashboard/owner"];
const adminPaths = ["/dashboard/admin"];

interface JwtPayload {
  role?: string;
  roles?: string[];
}

function getRoleFromToken(token: string): string | null {
  try {
    const decoded: JwtPayload = jwtDecode(token);

    if (decoded.roles && decoded.roles.length > 0) {
      return decoded.roles[0].toLowerCase();
    }
    if (decoded.role) {
      return decoded.role.toLowerCase();
    }

    return null;
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get("accessToken")?.value || "";
  const role = sessionToken ? getRoleFromToken(sessionToken) : null;

  if (adminPaths.some((path) => pathname.startsWith(path))) {
    if (!sessionToken) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/404", request.url));
    }
  }

  // OWNER DASHBOARD
  if (ownerPaths.some((path) => pathname.startsWith(path))) {
    if (!sessionToken) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }
    if (role !== "customer" && role !== "owner") {
      return NextResponse.redirect(new URL("/404", request.url));
    }
  }

  if (privatePaths.some((path) => pathname.startsWith(path))) {
    if (!sessionToken) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }
  }

  if (publicPaths.some((path) => pathname.startsWith(path))) {
    if (sessionToken) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/account",
    "/auth",
    "/auth/:path*",
    "/dashboard/owner/:path*",
    "/dashboard/admin/:path*",
  ],
};

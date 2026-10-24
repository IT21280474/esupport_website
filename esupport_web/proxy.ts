import { NextResponse, type NextRequest } from "next/server";

/* Optimistic gate for the admin area: no session cookie → login page.
   The real session/role check happens in lib/server/auth.ts on every page and action. */
const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/setup"];

export function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;
    if (PUBLIC_ADMIN_PATHS.some(p => pathname.startsWith(p))) return NextResponse.next();
    if (!req.cookies.get("es_admin_session")?.value) {
        return NextResponse.redirect(new URL("/admin/login", req.nextUrl));
    }
    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC = ["/", "/login", "/signup", "/forgot-password", "/verify", "/reset", "/auth/callback", "/api/alerts", "/api/news", "/api/ai/understand"];
const PUBLIC_PREFIX = ["/api/chat/", "/api/session", "/api/application", "/api/screen-time-config"];

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req });
  const sb = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list: { name: string; value: string; options?: CookieOptions }[]) => {
        list.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
      },
    },
  });
  const { data: { user } } = await sb.auth.getUser();
  const path = req.nextUrl.pathname;
  const isPublic = PUBLIC.includes(path) || PUBLIC_PREFIX.some((p) => path.startsWith(p));
  if (!user && !isPublic && path.startsWith("/api/")) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  if (!user && !isPublic) return NextResponse.redirect(new URL("/login", req.url));
  if (user && (path === "/login" || path === "/signup")) return NextResponse.redirect(new URL("/dashboard", req.url));
  return res;
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|api/public).*)"] };
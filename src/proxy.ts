// Runs before every page request:
// 1. keeps the Supabase login session fresh (refreshes its cookies), and
// 2. sends logged-out visitors away from /app, and logged-in users away from /login and /signup.
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Asks Supabase who is logged in (this also refreshes an expired session).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  if (!user && path.startsWith("/app")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (user && (path === "/login" || path === "/signup")) {
    return NextResponse.redirect(new URL("/app", request.url));
  }

  return response;
}

export const config = {
  // Skip static files and images; run on every page.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};

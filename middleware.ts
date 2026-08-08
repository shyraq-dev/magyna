import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Автор кабинеті (user management + moderation) — is_admin only.
  // Route name changed from the old "/admin" per the user's clarification:
  // they're "Автор" (founder), not a generic site admin.
  if (path.startsWith("/avtor")) {
    if (!user) {
      return NextResponse.redirect(new URL("/kiru", request.url));
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Жазушы кабинеті (books/dorama CRUD) — is_writer, a separate
  // permission from is_admin so a confirmed writer who isn't the
  // founder gets this without also getting the Автор кабинеті.
  if (path.startsWith("/jazushy")) {
    if (!user) {
      return NextResponse.redirect(new URL("/kiru", request.url));
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_writer")
      .eq("id", user.id)
      .single();

    if (!profile?.is_writer) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Protect the personal shelf / profile / notifications / settings
  // pages — but NOT /baptaular/kupiyalyk or /baptaular/erezheler, which
  // must stay public (linked from the footer for logged-out visitors).
  const isProtectedSettings =
    path === "/baptaular" ||
    path.startsWith("/baptaular/qauipsizdik") ||
    path.startsWith("/baptaular/qoldau") ||
    path.startsWith("/baptaular/tirkelgi") ||
    path.startsWith("/baptaular/kelbet") ||
    path.startsWith("/baptaular/oqu") ||
    path.startsWith("/baptaular/malimdeme") ||
    path.startsWith("/baptaular/jad");

  if (
    (path.startsWith("/sore") ||
      path.startsWith("/beyin") ||
      path.startsWith("/habarlandyrular") ||
      isProtectedSettings) &&
    !user
  ) {
    return NextResponse.redirect(new URL("/kiru", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/avtor/:path*",
    "/jazushy/:path*",
    "/sore/:path*",
    "/beyin",
    "/beyin/:path*",
    "/habarlandyrular",
    "/baptaular",
    "/baptaular/qauipsizdik/:path*",
    "/baptaular/qoldau/:path*",
    "/baptaular/tirkelgi/:path*",
    "/baptaular/kelbet/:path*",
    "/baptaular/oqu/:path*",
    "/baptaular/malimdeme/:path*",
    "/baptaular/jad/:path*",
  ],
};

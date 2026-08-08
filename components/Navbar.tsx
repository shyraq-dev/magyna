import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import NotificationBell from "@/components/NotificationBell";

export default async function Navbar() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let avatarUrl: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .single();
    avatarUrl = profile?.avatar_url ?? null;
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 font-display text-xl"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 2 L20 18 L12 22 L4 18 Z" fill="url(#nib)" />
            <defs>
              <linearGradient id="nib" x1="4" y1="2" x2="20" y2="22">
                <stop offset="0" stopColor="#E8CB8B" />
                <stop offset="1" stopColor="#A97D34" />
              </linearGradient>
            </defs>
          </svg>
          Мағына
        </Link>

        <nav className="flex flex-wrap items-center gap-4 text-sm sm:gap-6">
          <Link href="/kitaptar" className="hover:text-gold-600">
            Кітаптар
          </Link>
          <Link href="/dorama" className="hover:text-gold-600">
            Дорама
          </Link>

          {user && (
            <Link href="/sore" className="hover:text-gold-600">
              Менің сөрем
            </Link>
          )}

          {user && <NotificationBell />}

          {/* Profile icon: generic person icon when logged out, real
             avatar (or initial-letter circle) once registered — the
             role-specific cabinets (Жазушы/Автор) live on the profile
             page itself, not here. */}
          <Link
            href={user ? "/beyin" : "/kiru"}
            aria-label={user ? "Бейін" : "Кіру"}
            className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-white transition hover:border-gold-500"
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" />
                <path
                  d="M4 20c1.6-3.6 5-5.5 8-5.5s6.4 1.9 8 5.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}

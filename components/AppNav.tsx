import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import NotificationBell from "@/components/NotificationBell";
import NavThemeCycle from "@/components/NavThemeCycle";

const NIB_LOGO = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 2 L20 18 L12 22 L4 18 Z" fill="url(#nib)" />
    <defs>
      <linearGradient id="nib" x1="4" y1="2" x2="20" y2="22">
        <stop offset="0" stopColor="#E8CB8B" />
        <stop offset="1" stopColor="#A97D34" />
      </linearGradient>
    </defs>
  </svg>
);

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M20 20 16 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 11 12 4 20 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 10v9h12v-9" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 5.5C4 4.7 4.7 4 5.5 4H12v16H5.5c-.8 0-1.5-.7-1.5-1.5V5.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M20 5.5C20 4.7 19.3 4 18.5 4H12v16h6.5c.8 0 1.5-.7 1.5-1.5V5.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DoramaIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 20h6M12 17v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ShelfIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 4v16M20 4v16M4 12h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 20c1.6-3.6 5-5.5 8-5.5s6.4 1.9 8 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export default async function AppNav() {
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

  const profileHref = user ? "/beyin" : "/kiru";
  const profileLabel = user ? "Бейін" : "Кіру";

  const links = [
    { href: "/", label: "Басты бет", icon: <HomeIcon /> },
    { href: "/kitapkhana", label: "Кітапхана", icon: <BookIcon /> },
    { href: "/dorama", label: "Дорама", icon: <DoramaIcon /> },
    ...(user ? [{ href: "/sore", label: "Сөре", icon: <ShelfIcon /> }] : []),
  ];

  return (
    <>
      {/* ===== Mobile top strip: brand + search + bell + theme (lg:hidden) ===== */}
      <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-display text-lg">
            {NIB_LOGO}
            Мағына
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/izdeu"
              aria-label="Іздеу"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white transition hover:border-gold-500"
            >
              <SearchIcon />
            </Link>
            <NavThemeCycle />
            {user && <NotificationBell />}
          </div>
        </div>
      </header>

      {/* ===== Mobile bottom tab bar (lg:hidden) ===== */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 backdrop-blur lg:hidden">
        <div className="flex items-stretch justify-around">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] text-muted transition hover:text-gold-600"
            >
              {l.icon}
              {l.label}
            </Link>
          ))}
          <Link
            href={profileHref}
            className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] text-muted transition hover:text-gold-600"
          >
            {avatarUrl ? (
              <span className="h-[18px] w-[18px] overflow-hidden rounded-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
              </span>
            ) : (
              <PersonIcon />
            )}
            {profileLabel}
          </Link>
        </div>
      </nav>

      {/* ===== Desktop right sidebar (hidden below lg) ===== */}
      <aside className="fixed right-0 top-0 z-30 hidden h-screen w-56 flex-col border-l border-line bg-paper/95 backdrop-blur lg:flex">
        <Link href="/" className="flex items-center gap-2 px-6 py-6 font-display text-xl">
          {NIB_LOGO}
          Мағына
        </Link>
        <p className="px-6 text-xs uppercase tracking-[0.15em] text-muted">
          Оқы. Түсін. Жаз. Бөліс.
        </p>

        <nav className="mt-8 flex flex-1 flex-col gap-1 px-3">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center gap-3 rounded-sm px-3 py-2 text-sm text-muted transition hover:bg-paper-dim hover:text-gold-600"
            >
              {l.icon}
              {l.label}
            </Link>
          ))}
          {user && (
            <Link
              href="/habarlandyrular"
              className="flex items-center gap-3 rounded-sm px-3 py-2 text-sm text-muted transition hover:bg-paper-dim hover:text-gold-600"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M18 16v-5a6 6 0 1 0-12 0v5l-2 3h16l-2-3Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path d="M9.5 21a2.5 2.5 0 0 0 5 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Хабарландырулар
            </Link>
          )}
          <Link
            href="/izdeu"
            className="flex items-center gap-3 rounded-sm px-3 py-2 text-sm text-muted transition hover:bg-paper-dim hover:text-gold-600"
          >
            <SearchIcon />
            Іздеу
          </Link>
        </nav>

        <div className="flex items-center justify-between border-t border-line px-4 py-4">
          <NavThemeCycle />
          {user && <NotificationBell />}
          <Link
            href={profileHref}
            aria-label={profileLabel}
            className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-white transition hover:border-gold-500"
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <PersonIcon />
            )}
          </Link>
        </div>
      </aside>
    </>
  );
}

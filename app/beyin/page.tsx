import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";
import QuickAvatarUpload from "@/components/QuickAvatarUpload";
import { instagramUrl, tiktokUrl, websiteUrl } from "@/lib/social-links";

export default async function ProfilPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/kiru");

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "username, full_name, avatar_url, is_admin, is_writer, telegram_id, bio, instagram_url, tiktok_url, website_url, telegram_link"
    )
    .eq("id", user.id)
    .single();

  const { data: earnedBadges } = await supabase
    .from("user_badges")
    .select("badge_key, earned_at, badges(label, description)")
    .eq("user_id", user.id)
    .order("earned_at", { ascending: false });

  const displayName = profile?.full_name || profile?.username || "Оқырман";
  const initial = (profile?.username || user.email || "?").charAt(0).toUpperCase();
  const isPlaceholderEmail = user.email?.endsWith("@telegram.magyna.local");
  const socialLinks = [
    profile?.instagram_url && { label: "Instagram", href: instagramUrl(profile.instagram_url) },
    profile?.tiktok_url && { label: "TikTok", href: tiktokUrl(profile.tiktok_url) },
    profile?.telegram_link && { label: "Telegram", href: profile.telegram_link },
    profile?.website_url && { label: "Веб-сайт", href: websiteUrl(profile.website_url) },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <div className="flex items-center gap-5">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-nib-gradient font-display text-2xl text-ink">
          {profile?.avatar_url ? (
            // Avatars can come from Telegram or Supabase Storage — a plain
            // <img> avoids having to whitelist every possible host in
            // next.config.js image remotePatterns.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            initial
          )}
        </div>
        <div>
          <h1 className="font-display text-2xl">{displayName}</h1>
          {profile?.username && (
            <p className="text-sm text-muted">@{profile.username}</p>
          )}
          {/* Role badge-buttons: the founder sees both (Автор implies
             Жазушы); a promoted writer who isn't the founder sees only
             Жазушы; everyone else just gets the decorative reader badge. */}
          <div className="mt-2 flex flex-wrap gap-2">
            {profile?.is_admin && (
              <Link
                href="/avtor"
                className="flex items-center gap-1.5 rounded-sm border border-gold-500 bg-gold-300/10 px-3 py-1 text-xs text-gold-600 transition hover:bg-gold-300/20"
              >
                <span aria-hidden="true">🪶</span> Автор
              </Link>
            )}
            {profile?.is_writer && (
              <Link
                href="/jazushy"
                className="flex items-center gap-1.5 rounded-sm border border-line px-3 py-1 text-xs transition hover:border-gold-500"
              >
                <span aria-hidden="true">✒️</span> Жазушы
              </Link>
            )}
            {!profile?.is_admin && !profile?.is_writer && (
              <span className="flex items-center gap-1.5 rounded-sm border border-line px-3 py-1 text-xs text-muted">
                <span aria-hidden="true">📖</span> Оқырман
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action list — stacked top to bottom, not a horizontal row. */}
      <div className="mt-6 divide-y divide-line border-y border-line">
        <QuickAvatarUpload userId={user.id} currentAvatarUrl={profile?.avatar_url ?? null} />
        <Link
          href="/beyin/tuzetu"
          className="flex items-center gap-3 py-2 text-sm text-muted transition hover:text-gold-600"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 20l1-4.5L15.5 5 19 8.5 8.5 19 4 20Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          Өңдеу
        </Link>
        <Link
          href="/baptaular"
          className="flex items-center gap-3 py-2 text-sm text-muted transition hover:text-gold-600"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M19.4 12a7.4 7.4 0 0 0-.1-1.1l1.9-1.5-1.9-3.3-2.3.7a7.5 7.5 0 0 0-1.9-1.1L14.7 3h-5.4l-.4 2.7a7.5 7.5 0 0 0-1.9 1.1l-2.3-.7-1.9 3.3 1.9 1.5c-.1.4-.1.7-.1 1.1s0 .7.1 1.1l-1.9 1.5 1.9 3.3 2.3-.7c.6.5 1.2.8 1.9 1.1l.4 2.7h5.4l.4-2.7c.7-.3 1.3-.6 1.9-1.1l2.3.7 1.9-3.3-1.9-1.5c.1-.4.1-.7.1-1.1Z"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          Баптау
        </Link>
      </div>

      {earnedBadges && earnedBadges.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {earnedBadges.map((eb: any) => (
            <span
              key={eb.badge_key}
              title={eb.badges?.description ?? undefined}
              className="rounded-sm border border-gold-500 bg-gold-300/10 px-3 py-1 text-xs text-gold-600"
            >
              {eb.badges?.label ?? eb.badge_key}
            </span>
          ))}
        </div>
      )}

      {profile?.bio && <p className="mt-5 text-sm leading-relaxed">{profile.bio}</p>}

      {socialLinks.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-600 underline underline-offset-2"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}

      <div className="nib-divider" />

      <dl className="space-y-3 text-sm">
        {user.email && !isPlaceholderEmail && (
          <div className="flex justify-between border-b border-line pb-2">
            <dt className="text-muted">Email</dt>
            <dd>{user.email}</dd>
          </div>
        )}
        {profile?.telegram_id && (
          <div className="flex justify-between border-b border-line pb-2">
            <dt className="text-muted">Telegram</dt>
            <dd>Қосылған</dd>
          </div>
        )}
      </dl>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/sore"
          className="btn-secondary text-sm"
        >
          Менің сөрем
        </Link>
        <LogoutButton />
      </div>
    </div>
  );
}

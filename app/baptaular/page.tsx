import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const SECTIONS = [
  { href: "/baptaular/tirkelgi", icon: "👤", title: "Тіркелгі", subtitle: "Аты, сурет, username, әлеум. желілер" },
  { href: "/baptaular/kelbet", icon: "🎨", title: "Сыртқы келбет", subtitle: "Тақырып, түс, тіл" },
  { href: "/baptaular/oqu", icon: "📖", title: "Оқу параметрлері", subtitle: "Фон, шрифт, оқу режимі" },
  { href: "/baptaular/qauipsizdik", icon: "🔒", title: "Құпиялық пен қауіпсіздік", subtitle: "Құпия сөз, құрылғылар" },
  { href: "/baptaular/malimdeme", icon: "🔔", title: "Мәлімдеме", subtitle: "Дыбыс, хабарламалар" },
  { href: "/baptaular/jad", icon: "💾", title: "Жад", subtitle: "Кэш, файлдар" },
  { href: "/baptaular/qoldau", icon: "❓", title: "Көмек", subtitle: "FAQ, қолдау қызметі" },
];

export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/kiru");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, full_name, avatar_url")
    .eq("id", user.id)
    .single();

  const isPlaceholderEmail = user.email?.endsWith("@telegram.magyna.local");
  const initial = (profile?.username || "?").charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-lg px-6 py-10">
      <div className="flex items-center justify-between">
        <Link href="/beyin" aria-label="Артқа" className="text-lg text-muted hover:text-gold-600">
          ←
        </Link>
        <h1 className="font-display text-xl">Баптау</h1>
        <span className="w-5" aria-hidden="true" />
      </div>

      <div className="mt-8 flex items-center gap-4 border-b border-line pb-6">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-nib-gradient font-display text-xl text-ink">
          {profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            initial
          )}
        </div>
        <div>
          <p className="font-display text-lg">{profile?.full_name || profile?.username}</p>
          <p className="text-sm text-muted">
            @{profile?.username}
            {!isPlaceholderEmail && user.email ? ` • ${user.email}` : ""}
          </p>
        </div>
      </div>

      <ul className="mt-6 space-y-3">
        {SECTIONS.map((s) => (
          <li key={s.href}>
            <Link
              href={s.href}
              className="card-lift flex items-center gap-4 rounded-sm border border-line bg-white px-4 py-3 transition hover:border-gold-500"
            >
              <span className="text-xl" aria-hidden="true">{s.icon}</span>
              <div>
                <p className="font-medium">{s.title}</p>
                <p className="text-xs text-muted">{s.subtitle}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-8 text-center text-xs text-muted">Maǵyna v1.0.0</p>
    </div>
  );
}

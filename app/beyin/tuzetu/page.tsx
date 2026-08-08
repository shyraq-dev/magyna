import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProfileEditForm from "@/components/ProfileEditForm";

export default async function ProfileEditPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/kiru");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("username, full_name, bio, avatar_url, instagram_url, tiktok_url, website_url, telegram_link")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16">
        <Link href="/beyin" className="text-sm text-muted hover:text-gold-600">
          ← Бейін
        </Link>
        <h1 className="mt-4 font-display text-3xl">Бейінді өңдеу</h1>
        <p className="mt-6 rounded-sm border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          Профиль деректерін жүктеу сәтсіз аяқталды
          {error ? `: ${error.message}` : "."}
          {" "}Бұл әдетте <code>schema.sql</code>-дың ескі нұсқасы іске
          қосылғанын білдіреді (жаңа bio/instagram_url/tiktok_url/website_url
          бағандары жоқ). Supabase SQL Editor-де <code>schema.sql</code>-ды
          қайта іске қосып көріңіз.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <Link href="/beyin" className="text-sm text-muted hover:text-gold-600">
        ← Бейін
      </Link>
      <h1 className="mt-4 font-display text-3xl">Бейінді өңдеу</h1>
      <div className="mt-8">
        <ProfileEditForm userId={user.id} profile={profile} />
      </div>
    </div>
  );
}

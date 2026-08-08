import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DeleteAccountButton from "@/components/DeleteAccountButton";

export default async function AccountSettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/kiru");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, telegram_id")
    .eq("id", user.id)
    .single();

  const isPlaceholderEmail = user.email?.endsWith("@telegram.magyna.local");

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <Link href="/baptaular" className="text-sm text-muted hover:text-gold-600">
        ← Баптау
      </Link>
      <h1 className="mt-4 font-display text-3xl">Тіркелгі</h1>

      <dl className="mt-8 space-y-2 text-sm">
        <div className="flex justify-between border-b border-line pb-2">
          <dt className="text-muted">Пайдаланушы аты</dt>
          <dd>@{profile?.username}</dd>
        </div>
        {!isPlaceholderEmail && user.email && (
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

      <Link href="/beyin/tuzetu" className="btn-secondary mt-6 inline-block text-sm">
        Аты, сурет, bio, әлеум. желілерді өңдеу
      </Link>

      <div className="nib-divider" />

      <section>
        <h2 className="font-display text-xl text-red-700">Қауіпті аймақ</h2>
        <p className="mt-2 text-sm text-muted">
          Тіркелгіні өшіргенде барлық кітаптарыңыз, пікірлеріңіз және
          сөреңіз қайтарымсыз жойылады.
        </p>
        <div className="mt-4">
          <DeleteAccountButton />
        </div>
      </section>
    </div>
  );
}

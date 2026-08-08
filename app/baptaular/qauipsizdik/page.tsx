import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PasswordChangeForm from "@/components/PasswordChangeForm";

export default async function SecuritySettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/kiru");

  const isPlaceholderEmail = user.email?.endsWith("@telegram.magyna.local");

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <Link href="/baptaular" className="text-sm text-muted hover:text-gold-600">
        ← Баптау
      </Link>
      <h1 className="mt-4 font-display text-3xl">Құпиялық пен қауіпсіздік</h1>

      <section className="mt-8">
        <h2 className="font-display text-lg">Құпия сөз</h2>
        {isPlaceholderEmail ? (
          <p className="mt-2 text-sm text-muted">
            Сіз Telegram арқылы кірген тіркелгісіз — құпия сөз қажет емес.
          </p>
        ) : (
          <div className="mt-4">
            <PasswordChangeForm />
          </div>
        )}
      </section>

      <div className="nib-divider" />

      <section>
        <h2 className="font-display text-lg">Құрылғылар</h2>
        <p className="mt-2 text-sm text-muted">
          Қай құрылғыдан кірілгенін көру және қашықтан шығу — жоспарда,
          әлі жасалмады.
        </p>
      </section>
    </div>
  );
}

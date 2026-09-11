import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SignOutEverywhereButton from "@/components/SignOutEverywhereButton";

export default async function SecuritySettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/kiru");

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <Link href="/baptaular" className="text-sm text-muted hover:text-gold-600">
        ← Баптау
      </Link>
      <h1 className="mt-4 font-display text-3xl">Құпиялық пен қауіпсіздік</h1>

      <section className="mt-8">
        <h2 className="font-display text-lg">Барлық құрылғыдан шығу</h2>
        <p className="mt-2 text-sm text-muted">
          Тіркелгіден барлық браузер мен құрылғыда бір мезетте шығу.
          Күдікті іс-әрекет байқасаңыз пайдаланыңыз.
        </p>
        <div className="mt-4">
          <SignOutEverywhereButton />
        </div>
      </section>
    </div>
  );
}

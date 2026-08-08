import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ThemeToggle from "@/components/ThemeToggle";

export default async function AppearanceSettingsPage() {
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
      <h1 className="mt-4 font-display text-3xl">Сыртқы келбет</h1>

      <section className="mt-8">
        <h2 className="font-display text-lg">Тақырып</h2>
        <div className="mt-4">
          <ThemeToggle />
        </div>
      </section>

      <div className="nib-divider" />

      <section>
        <h2 className="font-display text-lg">Екпінді түс</h2>
        <p className="mt-2 text-sm text-muted">
          Жоспарда — қазір алтын/сия-көк түс жиынтығы бекітілген, таңдау
          мүмкіндігі әлі жоқ.
        </p>
      </section>

      <div className="nib-divider" />

      <section>
        <h2 className="font-display text-lg">Тіл</h2>
        <p className="mt-2 text-sm text-muted">
          Қазір қолданба тек қазақша. Автор тарапынан тіл
          қосу/өңдеу/жою мүмкіндігі (локализация басқармасы) — үлкен
          бөлек фича, әлі жасалмады.
        </p>
      </section>
    </div>
  );
}

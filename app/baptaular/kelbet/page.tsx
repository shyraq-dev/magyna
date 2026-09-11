import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ThemeToggle from "@/components/ThemeToggle";
import AccentPicker from "@/components/AccentPicker";
import LanguagePicker from "@/components/LanguagePicker";

export default async function AppearanceSettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/kiru");

  const { data: languages } = await supabase
    .from("languages")
    .select("code, name")
    .eq("is_active", true)
    .order("created_at");

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
        <div className="mt-4">
          <AccentPicker />
        </div>
      </section>

      <div className="nib-divider" />

      <section>
        <h2 className="font-display text-lg">Тіл</h2>
        <p className="mt-2 text-sm text-muted">
          Қазір интерфейс толығымен тек қазақша — тіл таңдау қазірше
          сақталады, бірақ мәтіндерді нақты аудармайды (локализация
          сөздігі әлі жоқ). Тілдер тізімін автор{" "}
          <Link href="/avtor/tilder" className="text-gold-600 underline">
            осы жерден
          </Link>{" "}
          басқарады.
        </p>
        <div className="mt-4">
          <LanguagePicker languages={languages ?? []} />
        </div>
      </section>
    </div>
  );
}

import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ClearCacheButton from "@/components/ClearCacheButton";

export default async function StorageSettingsPage() {
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
      <h1 className="mt-4 font-display text-3xl">Жад</h1>

      <section className="mt-8">
        <h2 className="font-display text-lg">Кэшті тазалау</h2>
        <p className="mt-2 text-sm text-muted">
          Сақталған суреттер мен уақытша файлдарды тазалайды, оқу
          баптауларын әдепкіге қайтарады. Тіркелгіңізден шығармайды.
        </p>
        <div className="mt-4">
          <ClearCacheButton />
        </div>
      </section>

      <div className="nib-divider" />

      <section>
        <h2 className="font-display text-lg">Офлайн оқу</h2>
        <p className="mt-2 text-sm text-muted">Жоспарда — әлі жасалмады.</p>
      </section>

      <div className="nib-divider" />

      <section>
        <h2 className="font-display text-lg">Дерек үнемдеу</h2>
        <p className="mt-2 text-sm text-muted">Жоспарда — әлі жасалмады.</p>
      </section>
    </div>
  );
}

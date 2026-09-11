import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LanguageManager from "@/components/admin/LanguageManager";

export default async function AdminLanguagesPage() {
  const supabase = createClient();
  const { data: languages } = await supabase
    .from("languages")
    .select("code, name, is_active")
    .order("created_at");

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <Link href="/avtor" className="text-sm text-muted hover:text-gold-600">
        ← Автор кабинеті
      </Link>
      <h1 className="mt-4 font-display text-3xl">Тілдер</h1>
      <p className="mt-2 text-sm text-muted">
        Тілдерді қосыңыз, өңдеңіз, белсенді/өшіріңіз. Әр тілдің
        аударма сөздігін тілді басу арқылы ашыңыз.
      </p>

      <div className="mt-6 mb-8 divide-y divide-line border-y border-line">
        {(languages ?? []).map((l) => (
          <Link
            key={l.code}
            href={`/avtor/tilder/${l.code}`}
            className="flex items-center justify-between py-3 hover:text-gold-600"
          >
            <span>{l.name}</span>
            <span className="flex items-center gap-3 text-xs text-muted">
              {!l.is_active && <span className="text-red-700">Өшірулі</span>}
              <span>Сөздік →</span>
            </span>
          </Link>
        ))}
      </div>

      <LanguageManager initial={languages ?? []} />
    </div>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import TranslationEditor from "@/components/admin/TranslationEditor";

export default async function LanguageDictionaryPage({
  params,
}: {
  params: { code: string };
}) {
  const supabase = createClient();

  const { data: language } = await supabase
    .from("languages")
    .select("code, name")
    .eq("code", params.code)
    .single();

  if (!language) notFound();

  const { data: translations } = await supabase
    .from("translations")
    .select("key, value")
    .eq("language_code", params.code)
    .order("key");

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/avtor/tilder" className="text-sm text-muted hover:text-gold-600">
        ← Тілдер
      </Link>
      <h1 className="mt-4 font-display text-3xl">{language.name} — Аударма</h1>
      <p className="mt-2 text-sm text-muted">
        Кілт бойынша мәтіндерді өңдеңіз. Кілт жоқ болса, қолданба
        қазақша нұсқаны қолданады.
      </p>

      <div className="mt-8">
        <TranslationEditor
          languageCode={params.code}
          initial={translations ?? []}
        />
      </div>
    </div>
  );
}

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import NewThreadForm from "@/components/NewThreadForm";

export default async function NewThreadPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/kiru");

  const { data: dorama } = await supabase
    .from("doramas")
    .select("id, slug, title")
    .eq("slug", params.slug)
    .eq("status", "published")
    .single();

  if (!dorama) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link href={`/dorama/${dorama.slug}`} className="text-sm text-muted hover:text-gold-600">
        ← {dorama.title}
      </Link>
      <p className="mt-4 text-sm text-muted">{dorama.title}</p>
      <h1 className="mt-1 font-display text-3xl">Жаңа тақырып</h1>
      <NewThreadForm doramaId={dorama.id} doramaSlug={dorama.slug} />
    </div>
  );
}

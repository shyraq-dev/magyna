import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DoramaCoverUpload from "@/components/admin/DoramaCoverUpload";
import DoramaFieldsForm from "@/components/admin/DoramaFieldsForm";
import DoramaPublishToggle from "@/components/admin/DoramaPublishToggle";
import DeleteDoramaButton from "@/components/admin/DeleteDoramaButton";

export default async function AdminDoramaEditPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: dorama } = await supabase
    .from("doramas")
    .select("id, slug, title, genre, synopsis, cover_url, external_url, trailer_url, status")
    .eq("slug", params.slug)
    .eq("created_by", user!.id)
    .single();

  if (!dorama) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/jazushy/dorama" className="text-sm text-muted hover:text-gold-600">
        ← Дорама тізімі
      </Link>
      <div className="mt-4 flex items-start justify-between gap-6">
        <h1 className="font-display text-3xl">{dorama.title}</h1>
        <div className="flex shrink-0 gap-3">
          <DoramaPublishToggle doramaId={dorama.id} status={dorama.status} />
          <DeleteDoramaButton doramaId={dorama.id} />
        </div>
      </div>

      <div className="nib-divider" />

      <h2 className="font-display text-xl">Мұқаба</h2>
      <div className="mt-4">
        <DoramaCoverUpload doramaId={dorama.id} currentCoverUrl={dorama.cover_url} />
      </div>

      <div className="nib-divider" />

      <h2 className="font-display text-xl">Мәліметтер</h2>
      <DoramaFieldsForm
        doramaId={dorama.id}
        initial={{
          title: dorama.title,
          genre: dorama.genre,
          synopsis: dorama.synopsis,
          external_url: dorama.external_url,
          trailer_url: dorama.trailer_url,
        }}
      />
    </div>
  );
}

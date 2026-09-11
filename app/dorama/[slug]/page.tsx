import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function DoramaPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();

  const { data: dorama } = await supabase
    .from("doramas")
    .select("id, slug, title, synopsis, genre, cover_url, trailer_url, external_url")
    .eq("slug", params.slug)
    .eq("status", "published")
    .single();

  if (!dorama) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: threads } = await supabase
    .from("dorama_threads")
    .select("id, title, created_at, user_id, profiles(username)")
    .eq("dorama_id", dorama.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="flex flex-col gap-8 sm:flex-row">
        {dorama.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dorama.cover_url}
            alt={dorama.title}
            className="aspect-[2/3] w-40 shrink-0 rounded-sm object-cover"
          />
        ) : (
          <div className="aspect-[2/3] w-40 shrink-0 rounded-sm bg-ink" />
        )}

        <div>
          <h1 className="font-display text-3xl">{dorama.title}</h1>
          {dorama.genre && <p className="mt-1 text-sm text-muted">{dorama.genre}</p>}
          {dorama.synopsis && <p className="mt-4 text-muted">{dorama.synopsis}</p>}

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={dorama.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Көру
            </a>
            {dorama.trailer_url && (
              <a
                href={dorama.trailer_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                Трейлер
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="nib-divider" />

      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl">Талқылау топтары</h2>
        {user ? (
          <Link
            href={`/dorama/${dorama.slug}/taqyryp/jana`}
            className="btn-primary px-4 py-2 text-sm"
          >
            + Жаңа тақырып
          </Link>
        ) : (
          <Link href="/kiru" className="text-sm text-gold-600 underline">
            Тақырып ашу үшін кіріңіз
          </Link>
        )}
      </div>

      <ul className="mt-6 divide-y divide-line">
        {threads?.length ? (
          threads.map((t: any) => (
            <li key={t.id}>
              <Link
                href={`/dorama/${dorama.slug}/taqyryp/${t.id}`}
                className="flex items-center justify-between py-4 hover:text-gold-600"
              >
                <span>{t.title}</span>
                <span className="text-xs text-muted">
                  @{t.profiles?.username ?? "белгісіз"} ·{" "}
                  {new Date(t.created_at).toLocaleDateString("kk-KZ")}
                </span>
              </Link>
            </li>
          ))
        ) : (
          <p className="py-6 text-muted">
            Әзірге тақырып жоқ. Алғашқысын сіз ашыңыз.
          </p>
        )}
      </ul>
    </div>
  );
}

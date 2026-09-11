import { createClient } from "@/lib/supabase/server";
import DoramaCard from "@/components/DoramaCard";

export default async function DoramaHubPage() {
  const supabase = createClient();
  const { data: doramas } = await supabase
    .from("doramas")
    .select("slug, title, genre, cover_url")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-3xl">Дорама</h1>
      <p className="mt-2 text-muted">
        Дорамалар каталогы — сыртқы сілтемелер мен талқылаулар
      </p>

      <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
        {doramas?.length ? (
          doramas.map((d: any) => (
            <DoramaCard
              key={d.slug}
              slug={d.slug}
              title={d.title}
              genre={d.genre}
              coverUrl={d.cover_url}
            />
          ))
        ) : (
          <div className="col-span-full empty-state">
            <span className="empty-state-icon" aria-hidden="true">
              🎭
            </span>
            <div>
              <p className="font-display text-lg">Әзірге дорама жоқ</p>
              <p className="mt-1 text-sm text-muted">Жақында толығады.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import BookCard from "@/components/BookCard";
import DoramaCard from "@/components/DoramaCard";

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let displayName: string | null = null;
  let continueReading: any[] | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, full_name")
      .eq("id", user.id)
      .single();
    displayName = profile?.full_name || profile?.username || null;

    const { data } = await supabase
      .from("reading_progress")
      .select("position, updated_at, books(slug, title, cover_url), chapters(chapter_number)")
      .eq("user_id", user.id)
      .is("finished_at", null)
      .order("updated_at", { ascending: false })
      .limit(8);
    continueReading = data;
  }

  const { data: newBooks } = await supabase
    .from("books")
    .select("slug, title, description, cover_url")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(8);

  const { data: doramas } = await supabase
    .from("doramas")
    .select("slug, title, genre, cover_url")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(8);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <p className="font-display text-sm uppercase tracking-[0.2em] text-gold-600">
        Оқы. Түсін. Жаз. Бөліс.
      </p>
      <h1 className="mt-2 font-display text-2xl sm:text-3xl">
        Қош келдіңіз{displayName ? `, ${displayName}` : ""}!
      </h1>
      {!user && (
        <p className="mt-3 max-w-xl text-muted">
          Қазақ тіліндегі кітаптарды оқып, өз сөреңізге жинаңыз.{" "}
          <Link href="/kiru" className="text-gold-600 underline">
            Кіріп
          </Link>{" "}
          сөре жинауды, лүпіл басуды және талқылауға қатысуды бастаңыз.
        </p>
      )}

      {continueReading && continueReading.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-xl">Оқып жатырсыз</h2>
          <div className="hscroll mt-4">
            {continueReading.map((r: any) => (
              <Link
                key={r.books.slug}
                href={`/kitapkhana/${r.books.slug}/${r.chapters?.chapter_number ?? 1}`}
                className="w-32 shrink-0"
              >
                <div className="card-lift relative aspect-[2/3] overflow-hidden rounded-sm bg-ink">
                  {r.books.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.books.cover_url} alt={r.books.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center p-3 text-center font-display text-sm text-paper">
                      {r.books.title}
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-black/30">
                    <div
                      className="h-full bg-gold-500"
                      style={{ width: `${Math.round((r.position ?? 0) * 100)}%` }}
                    />
                  </div>
                </div>
                <p className="mt-2 line-clamp-1 text-sm font-medium">{r.books.title}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl">Жаңа кітаптар</h2>
          <Link href="/kitapkhana" className="text-sm text-gold-600 hover:underline">
            Барлығы →
          </Link>
        </div>
        <div className="hscroll mt-4">
          {newBooks?.length ? (
            newBooks.map((b) => (
              <div key={b.slug} className="w-36 shrink-0">
                <BookCard slug={b.slug} title={b.title} description={b.description} coverUrl={b.cover_url} />
              </div>
            ))
          ) : (
            <div className="empty-state w-full">
              <span className="empty-state-icon" aria-hidden="true">📖</span>
              <div>
                <p className="font-display text-lg">Әзірге кітап жоқ</p>
                <p className="mt-1 text-sm text-muted">Жақында жаңа туындылар осында пайда болады.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl">Танымал дорамалар</h2>
          <Link href="/dorama" className="text-sm text-gold-600 hover:underline">
            Барлығы →
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
          {doramas?.length ? (
            doramas.map((d: any) => (
              <DoramaCard key={d.slug} slug={d.slug} title={d.title} genre={d.genre} coverUrl={d.cover_url} />
            ))
          ) : (
            <p className="col-span-full text-muted">Әзірге дорама жоқ.</p>
          )}
        </div>
      </section>
    </div>
  );
}

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import BookCard from "@/components/BookCard";
import DoramaCard from "@/components/DoramaCard";

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return <AuthenticatedHome userId={user.id} />;
  }
  return <MarketingLanding />;
}

async function AuthenticatedHome({ userId }: { userId: string }) {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", userId)
    .single();

  const { data: continueReading } = await supabase
    .from("reading_progress")
    .select("position, updated_at, books(slug, title, cover_url), chapters(chapter_number)")
    .eq("user_id", userId)
    .is("finished_at", null)
    .order("updated_at", { ascending: false })
    .limit(8);

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
      <h1 className="font-display text-2xl">
        Қайта қош келдіңіз{profile?.username ? `, ${profile.username}` : ""}!
      </h1>

      {continueReading && continueReading.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-xl">Оқып жатырсыз</h2>
          <div className="hscroll mt-4">
            {continueReading.map((r: any) => (
              <Link
                key={r.books.slug}
                href={`/kitaptar/${r.books.slug}/${r.chapters?.chapter_number ?? 1}`}
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
          <Link href="/kitaptar" className="text-sm text-gold-600 hover:underline">
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
            <p className="text-muted">Әзірге кітап жоқ.</p>
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
        <div className="hscroll mt-4">
          {doramas?.length ? (
            doramas.map((d: any) => (
              <div key={d.slug} className="w-36 shrink-0">
                <DoramaCard slug={d.slug} title={d.title} genre={d.genre} coverUrl={d.cover_url} />
              </div>
            ))
          ) : (
            <p className="text-muted">Әзірге дорама жоқ.</p>
          )}
        </div>
      </section>
    </div>
  );
}

async function MarketingLanding() {
  const supabase = createClient();
  const { data: books } = await supabase
    .from("books")
    .select("slug, title, description, cover_url")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(8);

  return (
    <>
      <section className="relative overflow-hidden">
        <svg
          className="pointer-events-none absolute -right-24 -top-16 hidden h-[420px] w-[420px] opacity-[0.07] lg:block"
          viewBox="0 0 200 200"
          fill="none"
          aria-hidden="true"
        >
          <path d="M100 20 L160 140 L100 175 L40 140 Z" stroke="#14182B" strokeWidth="1.5" />
          <path d="M100 20 L100 175" stroke="#14182B" strokeWidth="1.5" />
        </svg>

        <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-20 sm:pt-28">
          <p className="font-display text-sm uppercase tracking-[0.2em] text-gold-600">
            Оқы. Түсін. Жаз. Бөліс.
          </p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl leading-tight sm:text-6xl">
            Әр парақ — жаңа мағына.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted">
            Қазақ тіліндегі кітаптарды оқып, өз сөреңізге жинаңыз. Жаңа
            туындылар, талқылаулар мен пікірлер бір мекенде.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/kitaptar" className="btn-primary">
              Кітаптарды қарау
            </Link>
            <Link href="/kiru" className="btn-secondary">
              Тіркелу
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6">
        <div className="nib-divider" />
      </div>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <h2 className="font-display text-2xl">Жаңа кітаптар</h2>
        <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
          {books?.length ? (
            books.map((b) => (
              <BookCard key={b.slug} slug={b.slug} title={b.title} description={b.description} coverUrl={b.cover_url} />
            ))
          ) : (
            <div className="col-span-full empty-state">
              <span className="empty-state-icon" aria-hidden="true">📖</span>
              <div>
                <p className="font-display text-lg">Әзірге кітап жоқ</p>
                <p className="mt-1 text-sm text-muted">Жақында жаңа туындылар осында пайда болады.</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

import { createClient } from '@/lib/supabase/server';
import BookCard from '@/components/BookCard';
import Carousel from '@/components/Carousel';
import LiveSearch from '@/components/LiveSearch';
import GenreFilter from '@/components/GenreFilter';
import type { Book } from '@/types/database';

export const revalidate = 0;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; genre?: string }>;
}) {
  const { q: qParam, genre: genreSlug } = await searchParams;
  const supabase = await createClient();
  const q = qParam?.trim();

  const { data: genres } = await supabase.from('genres').select('id, name, slug').order('name');

  let books: Book[] | null = null;

  if (q) {
    // Толық мәтінді іздеу (title + description), fallback — ilike
    const ftsWords = q.trim().split(/\s+/).join(' & ');
    const { data: ftsResults } = await supabase
      .from('books')
      .select('*, author:profiles(id, username, display_name, avatar_url)')
      .eq('status', 'published')
      .textSearch('search_vector', ftsWords, { type: 'plain', config: 'simple' })
      .limit(24);

    if (ftsResults && ftsResults.length > 0) {
      books = ftsResults as unknown as Book[];
    } else {
      const { data: fallback } = await supabase
        .from('books')
        .select('*, author:profiles(id, username, display_name, avatar_url)')
        .eq('status', 'published')
        .ilike('title', `%${q}%`)
        .limit(24);
      books = fallback as unknown as Book[];
    }
  } else if (genreSlug) {
    const { data: genreRow } = await supabase.from('genres').select('id').eq('slug', genreSlug).single();
    if (genreRow) {
      const { data: byGenre } = await supabase
        .from('book_genres')
        .select('book:books(*, author:profiles(id, username, display_name, avatar_url))')
        .eq('genre_id', genreRow.id);
      books = ((byGenre ?? []) as any[])
        .map((r) => r.book)
        .filter((b) => b?.status === 'published') as unknown as Book[];
    } else {
      books = [];
    }
  }

  // Каруселдер тек негізгі көрініс (іздеусіз, жанрсыз) кезінде көрінеді
  let featured: Book[] = [];
  let newest: Book[] = [];
  let topRated: Book[] = [];

  if (!q && !genreSlug) {
    const [{ data: f }, { data: n }, { data: t }] = await Promise.all([
      supabase
        .from('books')
        .select('*, author:profiles(id, username, display_name, avatar_url)')
        .eq('status', 'published')
        .eq('is_featured', true)
        .limit(10),
      supabase
        .from('books')
        .select('*, author:profiles(id, username, display_name, avatar_url)')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('books')
        .select('*, author:profiles(id, username, display_name, avatar_url)')
        .eq('status', 'published')
        .order('likes_count', { ascending: false })
        .limit(10),
    ]);
    featured = (f as unknown as Book[]) ?? [];
    newest = (n as unknown as Book[]) ?? [];
    topRated = (t as unknown as Book[]) ?? [];
  }

  const showingFilteredList = !!q || !!genreSlug;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <section className="mb-10">
        <p className="font-body text-sm uppercase tracking-[0.2em] text-ember-400">Дала әңгімелері</p>
        <h1 className="mt-2 max-w-2xl font-display text-4xl leading-tight text-parchment-100 sm:text-5xl">
          Оқы, жаз, өз мағынаңды тап.
        </h1>
        <p className="mt-3 max-w-xl text-parchment-200/70">
          Қазақ авторларының кітаптары мен оқиғалары бір алаңда — түнгі оқу режимімен,
          бетбелгімен және офлайн оқу мүмкіндігімен.
        </p>
        <div className="mt-6 max-w-md">
          <LiveSearch defaultValue={q} />
        </div>
        <div className="mt-4">
          <GenreFilter genres={genres ?? []} />
        </div>
      </section>

      {!showingFilteredList && (
        <>
          <Carousel title="Бүгінгі таңдау" books={featured} />
          <Carousel title="Жаңа мағыналар" books={newest} />
          <Carousel title="Оқырмандар сүйіктісі" books={topRated} />
        </>
      )}

      {showingFilteredList && (
        <section>
          <h2 className="mb-4 font-display text-2xl text-parchment-100">
            {q ? `«${q}» бойынша нәтижелер` : 'Жанр бойынша'}
          </h2>
          {books && books.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {books.map((b) => (
                <BookCard key={b.id} book={b} />
              ))}
            </div>
          ) : (
            <p className="text-parchment-200/60">Ештеңе табылмады. Басқа сөзбен іздеп көріңіз.</p>
          )}
        </section>
      )}
    </div>
  );
}

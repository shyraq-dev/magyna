import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Reader from '@/components/Reader';
import CommentSection from '@/components/CommentSection';
import LibraryButton from '@/components/LibraryButton';
import DownloadButton from '@/components/DownloadButton';
import StarRating from '@/components/StarRating';
import ReportButton from '@/components/ReportButton';
import { estimateReadingTime } from '@/lib/text';

export const revalidate = 0;

export default async function BookPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ chapter?: string }>;
}) {
  const { id } = await params;
  const { chapter: chapterParam } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: book } = await supabase
    .from('books')
    .select('*, author:profiles(id, username, display_name, avatar_url), genres:book_genres(genre:genres(id, name, slug))')
    .eq('id', id)
    .single();

  if (!book) notFound();

  const { data: chapters } = await supabase
    .from('chapters')
    .select('id, title, order_index, status, word_count')
    .eq('book_id', id)
    .eq('status', 'published')
    .order('order_index');

  const totalWords = chapters?.reduce((sum, c) => sum + (c.word_count ?? 0), 0) ?? 0;

  // Оқуды жалғастыру: сақталған прогресс болса, сол тарауды ашамыз
  const { data: savedProgress } = user
    ? await supabase
        .from('reading_progress')
        .select('chapter_id, scroll_position')
        .eq('user_id', user.id)
        .eq('book_id', id)
        .maybeSingle()
    : { data: null };

  const activeChapterId = chapterParam ?? savedProgress?.chapter_id ?? chapters?.[0]?.id;

  const { data: activeChapter } = activeChapterId
    ? await supabase.from('chapters').select('*').eq('id', activeChapterId).single()
    : { data: null };

  const initialScroll =
    savedProgress?.chapter_id === activeChapterId ? Number(savedProgress?.scroll_position ?? 0) : 0;

  // Оқылым логы (аналитика үшін — авторизациясыз да)
  await supabase.from('book_view_events').insert({ book_id: id });
  if (user) {
    await supabase
      .from('books')
      .update({ views_count: (book.views_count ?? 0) + 1 })
      .eq('id', id);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-6 sm:flex-row">
        <div className="aspect-[2/3] w-40 shrink-0 overflow-hidden rounded-lg bg-night-800">
          {book.cover_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={book.cover_url} alt={book.title} className="h-full w-full object-cover" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <h1 className="font-display text-3xl text-parchment-100">{book.title}</h1>
            <ReportButton contentType="book" contentId={book.id} userId={user?.id ?? null} />
          </div>
          <p className="mt-1 text-sm text-parchment-200/60">
            {book.author?.display_name ?? book.author?.username}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-night-600 px-2.5 py-0.5 text-xs text-parchment-200/70">
              {book.writing_status === 'completed' ? 'Аяқталды' : 'Жазылуда'}
            </span>
            {book.genres?.map((g: any) => (
              <span
                key={g.genre.id}
                className="rounded-full border border-night-600 px-2.5 py-0.5 text-xs text-parchment-200/70"
              >
                {g.genre.name}
              </span>
            ))}
          </div>

          <p className="mt-4 max-w-2xl text-sm text-parchment-200/80">{book.description}</p>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-parchment-200/50">
            <span>{chapters?.length ?? 0} тарау</span>
            <span>{estimateReadingTime(totalWords)}</span>
            <span>{book.views_count} оқылым</span>
          </div>

          <div className="mt-3">
            <StarRating bookId={book.id} userId={user?.id ?? null} />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            {activeChapterId && (
              <Link
                href={`/books/${book.id}?chapter=${activeChapterId}`}
                className="focus-ring rounded-full bg-ember-500 px-5 py-2 text-sm font-medium text-night-950 hover:bg-ember-400"
              >
                {savedProgress ? 'Оқуды жалғастыру' : 'Оқуды бастау'}
              </Link>
            )}
            <LibraryButton bookId={book.id} userId={user?.id ?? null} />
            <DownloadButton
              bookId={book.id}
              title={book.title}
              coverUrl={book.cover_url}
              authorName={book.author?.display_name ?? book.author?.username ?? null}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
        <aside>
          <h2 className="mb-3 font-display text-lg text-parchment-100">Тараулар</h2>
          <ul className="flex flex-col gap-1">
            {chapters?.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/books/${book.id}?chapter=${c.id}`}
                  className={`focus-ring block rounded px-2 py-1.5 text-sm ${
                    c.id === activeChapterId
                      ? 'bg-ember-500/20 text-ember-400'
                      : 'text-parchment-200/70 hover:bg-night-800'
                  }`}
                >
                  {c.order_index + 1}. {c.title}
                </Link>
              </li>
            ))}
            {(!chapters || chapters.length === 0) && (
              <p className="text-sm text-parchment-200/50">Тараулар әлі жарияланбаған.</p>
            )}
          </ul>
        </aside>

        <div>
          {activeChapter ? (
            <Reader
              chapter={activeChapter}
              bookId={book.id}
              bookTitle={book.title}
              userId={user?.id ?? null}
              initialScroll={initialScroll}
              chapters={chapters ?? []}
            />
          ) : (
            <p className="text-parchment-200/60">Оқуға тарау жоқ.</p>
          )}

          <div className="mt-12">
            <CommentSection bookId={book.id} userId={user?.id ?? null} />
          </div>
        </div>
      </div>
    </div>
  );
}

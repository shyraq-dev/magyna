import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import BookCard from '@/components/BookCard';
import LogoutButton from '@/components/LogoutButton';
import type { Book } from '@/types/database';

export const revalidate = 0;

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', id).single();
  if (!profile) notFound();

  const isOwner = user?.id === profile.id;

  const { data: books } = await supabase
    .from('books')
    .select('*, author:profiles(id, username, display_name)')
    .eq('author_id', profile.id)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  const { data: draftBooks } = isOwner && profile.role === 'admin'
    ? await supabase
        .from('books')
        .select('id, title, cover_url')
        .eq('author_id', profile.id)
        .eq('status', 'draft')
        .order('updated_at', { ascending: false })
    : { data: null };

  const { data: progressRows } = isOwner
    ? await supabase
        .from('reading_progress')
        .select('book_id, chapter_id, updated_at, book:books(*, author:profiles(id, username, display_name))')
        .eq('user_id', profile.id)
        .order('updated_at', { ascending: false })
    : { data: null };

  const { data: library } = isOwner
    ? await supabase
        .from('library')
        .select('book:books(*, author:profiles(id, username, display_name))')
        .eq('user_id', profile.id)
    : { data: null };

  // Әр оқылып жатқан кітаптың пайызын есептеу (ағымдағы тарау реті / жалпы тарау саны)
  const currentReads: { book: Book; percent: number }[] = [];
  const archive: Book[] = [];
  if (progressRows) {
    for (const row of progressRows as any[]) {
      if (!row.book) continue;
      const { count: totalChapters } = await supabase
        .from('chapters')
        .select('id', { count: 'exact', head: true })
        .eq('book_id', row.book_id)
        .eq('status', 'published');
      const { data: chapterRow } = await supabase
        .from('chapters')
        .select('order_index')
        .eq('id', row.chapter_id)
        .single();
      const percent =
        totalChapters && chapterRow
          ? Math.min(100, Math.round(((chapterRow.order_index + 1) / totalChapters) * 100))
          : 0;
      if (percent >= 100) archive.push(row.book as Book);
      else currentReads.push({ book: row.book as Book, percent });
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-night-800">
            {profile.avatar_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
            )}
          </div>
          <div>
            <h1 className="font-display text-2xl text-parchment-100">
              {profile.display_name ?? profile.username}
            </h1>
            <p className="text-sm text-parchment-200/60">@{profile.username}</p>
            {profile.bio && <p className="mt-1 max-w-md text-sm text-parchment-200/70">{profile.bio}</p>}
            {(profile.socials?.instagram || profile.socials?.tiktok || profile.socials?.website) && (
              <div className="mt-2 flex gap-3 text-xs text-ember-400">
                {profile.socials.instagram && <span>IG: {profile.socials.instagram}</span>}
                {profile.socials.tiktok && <span>TikTok: {profile.socials.tiktok}</span>}
                {profile.socials.website && (
                  <a href={profile.socials.website} target="_blank" rel="noreferrer" className="hover:underline">
                    Веб-сайт
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
        {isOwner && (
          <div className="flex gap-2">
            <Link
              href="/profile/edit"
              className="focus-ring rounded-full border border-night-600 px-4 py-1.5 text-sm hover:border-ember-500"
            >
              Профильді баптау
            </Link>
            <LogoutButton />
          </div>
        )}
      </div>

      {isOwner && profile.role === 'admin' && (
        <section className="mb-10 rounded-lg border border-ember-500/30 bg-ember-500/5 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-xl text-parchment-100">Жазушы кабинеті</h2>
            <Link href="/write" className="focus-ring text-sm text-ember-400 hover:underline">
              Толығырақ →
            </Link>
          </div>
          {draftBooks && draftBooks.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto">
              {draftBooks.map((b) => (
                <Link
                  key={b.id}
                  href={`/write/${b.id}`}
                  className="focus-ring w-20 shrink-0 text-center text-xs text-parchment-200/60"
                >
                  <div className="mb-1 aspect-[2/3] overflow-hidden rounded bg-night-800">
                    {b.cover_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={b.cover_url} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  {b.title}
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-parchment-200/50">Черновик жоқ.</p>
          )}
        </section>
      )}

      {isOwner && currentReads.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 font-display text-xl text-parchment-100">Оқып жатырмын</h2>
          <div className="flex flex-col gap-3">
            {currentReads.map(({ book, percent }) => (
              <Link
                key={book.id}
                href={`/books/${book.id}`}
                className="focus-ring flex items-center gap-4 rounded-lg border border-night-700 bg-night-900 p-3 hover:border-ember-500/50"
              >
                <div className="h-16 w-12 shrink-0 overflow-hidden rounded bg-night-800">
                  {book.cover_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={book.cover_url} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-display text-base text-parchment-100">{book.title}</p>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-night-700">
                    <div className="h-full bg-ember-500" style={{ width: `${percent}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-parchment-200/50">{percent}% оқылды</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mb-10">
        <h2 className="mb-4 font-display text-xl text-parchment-100">
          {isOwner ? `${profile.role === 'admin' ? 'Менің жарияланғандарым' : 'Кітаптары'}` : 'Кітаптары'}
        </h2>
        {books && books.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {books.map((b) => (
              <BookCard key={b.id} book={b as unknown as Book} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-parchment-200/50">Жарияланған кітап жоқ.</p>
        )}
      </section>

      {isOwner && library && library.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 font-display text-xl text-parchment-100">Таңдаулылар</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {library.map((l: any) => (
              <BookCard key={l.book.id} book={l.book as Book} />
            ))}
          </div>
        </section>
      )}

      {isOwner && archive.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-xl text-parchment-100">Мұрағат</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {archive.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

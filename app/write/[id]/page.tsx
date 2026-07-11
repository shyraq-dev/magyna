import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PublishToggle from '@/components/PublishToggle';
import NewChapterButton from '@/components/NewChapterButton';

export const revalidate = 0;

export default async function BookWorkspace({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/');

  const { data: book } = await supabase.from('books').select('*').eq('id', id).single();
  if (!book || book.author_id !== user.id) notFound();

  const { data: chapters } = await supabase
    .from('chapters')
    .select('id, title, status, order_index, scheduled_at')
    .eq('book_id', id)
    .order('order_index');

  const { count: commentCount } = await supabase
    .from('comments')
    .select('id', { count: 'exact', head: true })
    .eq('book_id', id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-3xl text-parchment-100">{book.title}</h1>
            <span className="rounded-full border border-night-600 px-2 py-0.5 text-xs text-parchment-200/60">
              {book.writing_status === 'completed' ? 'Аяқталды' : 'Жазылуда'}
            </span>
          </div>
          <p className="mt-1 text-sm text-parchment-200/60">{book.description}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <PublishToggle bookId={book.id} status={book.status} />
          <Link href={`/write/${book.id}/analytics`} className="focus-ring text-xs text-ember-400 hover:underline">
            Толық статистика →
          </Link>
        </div>
      </div>

      <div className="mb-10 grid grid-cols-3 gap-3 text-center">
        <Stat label="Оқылым" value={book.views_count} />
        <Stat label="Лайк" value={book.likes_count} />
        <Stat label="Пікір" value={commentCount ?? 0} />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl text-parchment-100">Тараулар</h2>
        <NewChapterButton bookId={book.id} nextOrder={chapters?.length ?? 0} />
      </div>

      <ul className="flex flex-col gap-2">
        {chapters?.map((c) => (
          <li key={c.id}>
            <Link
              href={`/write/${book.id}/chapters/${c.id}`}
              className="focus-ring flex items-center justify-between rounded-md border border-night-700 bg-night-900 px-4 py-3 hover:border-ember-500/50"
            >
              <span className="text-sm text-parchment-100">
                {c.order_index + 1}. {c.title}
              </span>
              <span
                className={`text-xs ${
                  c.status === 'published' ? 'text-steppe-400' : 'text-parchment-200/40'
                }`}
              >
                {c.status === 'published'
                  ? 'Жарияланған'
                  : c.scheduled_at
                    ? `Жоспарланған: ${new Date(c.scheduled_at).toLocaleString('kk-KZ')}`
                    : 'Черновик'}
              </span>
            </Link>
          </li>
        ))}
        {(!chapters || chapters.length === 0) && (
          <p className="text-sm text-parchment-200/50">Әзірге тарау жоқ.</p>
        )}
      </ul>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-night-700 bg-night-900 py-4">
      <p className="font-display text-2xl text-ember-400">{value}</p>
      <p className="text-xs text-parchment-200/50">{label}</p>
    </div>
  );
}

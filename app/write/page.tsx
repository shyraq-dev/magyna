import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 0;

export default async function WriteDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/');

  const { data: books } = await supabase
    .from('books')
    .select('id, title, status, views_count, likes_count, cover_url')
    .eq('author_id', user.id)
    .order('updated_at', { ascending: false });

  const { data: commentCount } = await supabase
    .from('comments')
    .select('book_id', { count: 'exact', head: true });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-parchment-100">Жазушы кабинеті</h1>
          <p className="mt-1 text-sm text-parchment-200/60">Кітаптарыңызды басқарыңыз</p>
        </div>
        <Link
          href="/write/new"
          className="focus-ring rounded-full bg-ember-500 px-5 py-2 text-sm font-medium text-night-950 hover:bg-ember-400"
        >
          + Жаңа кітап
        </Link>
      </div>

      {books && books.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {books.map((b) => (
            <li key={b.id}>
              <Link
                href={`/write/${b.id}`}
                className="focus-ring flex items-center gap-4 rounded-lg border border-night-700 bg-night-900 p-4 hover:border-ember-500/50"
              >
                <div className="h-16 w-12 shrink-0 overflow-hidden rounded bg-night-800">
                  {b.cover_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={b.cover_url} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-display text-lg text-parchment-100">{b.title}</p>
                  <p className="text-xs text-parchment-200/50">
                    {b.status === 'published' ? 'Жарияланған' : 'Черновик'} · {b.views_count} оқылым · ♥{' '}
                    {b.likes_count}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-parchment-200/60">Әзірге кітап жоқ. Жаңа кітап бастаңыз!</p>
      )}
    </div>
  );
}

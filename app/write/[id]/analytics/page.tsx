import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SimpleBarChart from '@/components/SimpleBarChart';

export const revalidate = 0;

const WEEKDAY_LABELS = ['Жс', 'Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сб'];

export default async function BookAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/');

  const { data: book } = await supabase.from('books').select('id, title, author_id').eq('id', id).single();
  if (!book || book.author_id !== user.id) notFound();

  const { data: chapters } = await supabase
    .from('chapters')
    .select('id, title, views_count, likes_count, order_index')
    .eq('book_id', id)
    .order('order_index');

  const { count: commentCount } = await supabase
    .from('comments')
    .select('id', { count: 'exact', head: true })
    .eq('book_id', id);

  const { data: viewEvents } = await supabase
    .from('book_view_events')
    .select('viewed_at')
    .eq('book_id', id)
    .gte('viewed_at', new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString());

  const weekdayCounts = [0, 0, 0, 0, 0, 0, 0];
  (viewEvents ?? []).forEach((e) => {
    const day = new Date(e.viewed_at).getDay();
    weekdayCounts[day]++;
  });

  const totalViews = chapters?.reduce((sum, c) => sum + c.views_count, 0) ?? 0;
  const totalLikes = chapters?.reduce((sum, c) => sum + c.likes_count, 0) ?? 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-1 font-display text-3xl text-parchment-100">Статистика</h1>
      <p className="mb-8 text-sm text-parchment-200/60">{book.title}</p>

      <div className="mb-10 grid grid-cols-3 gap-3 text-center">
        <Stat label="Жалпы оқылым" value={totalViews} />
        <Stat label="Жалпы лайк" value={totalLikes} />
        <Stat label="Пікір" value={commentCount ?? 0} />
      </div>

      <div className="mb-10 rounded-lg border border-night-700 bg-night-900 p-5">
        <h2 className="mb-4 font-display text-lg text-parchment-100">Соңғы 7 күндегі белсенділік</h2>
        <SimpleBarChart data={weekdayCounts} labels={WEEKDAY_LABELS} />
      </div>

      <div>
        <h2 className="mb-4 font-display text-lg text-parchment-100">Тараулар бойынша</h2>
        <div className="overflow-hidden rounded-lg border border-night-700">
          <table className="w-full text-sm">
            <thead className="bg-night-900 text-left text-xs text-parchment-200/50">
              <tr>
                <th className="px-4 py-2">Тарау</th>
                <th className="px-4 py-2">Оқылым</th>
                <th className="px-4 py-2">Лайк</th>
              </tr>
            </thead>
            <tbody>
              {chapters?.map((c) => (
                <tr key={c.id} className="border-t border-night-800">
                  <td className="px-4 py-2 text-parchment-100">
                    {c.order_index + 1}. {c.title}
                  </td>
                  <td className="px-4 py-2 text-parchment-200/60">{c.views_count}</td>
                  <td className="px-4 py-2 text-parchment-200/60">{c.likes_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
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

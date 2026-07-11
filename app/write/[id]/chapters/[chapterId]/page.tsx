import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ChapterEditor from '@/components/ChapterEditor';

export const revalidate = 0;

export default async function ChapterEditPage({
  params,
}: {
  params: Promise<{ id: string; chapterId: string }>;
}) {
  const { id, chapterId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/');

  const { data: book } = await supabase.from('books').select('id, author_id, title').eq('id', id).single();
  if (!book || book.author_id !== user.id) notFound();

  const { data: chapter } = await supabase
    .from('chapters')
    .select('*')
    .eq('id', chapterId)
    .eq('book_id', id)
    .single();
  if (!chapter) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="mb-2 text-sm text-parchment-200/50">{book.title}</p>
      <ChapterEditor chapter={chapter} bookId={id} />
    </div>
  );
}

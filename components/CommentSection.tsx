'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { filterProfanity } from '@/lib/contentFilter';
import ReportButton from '@/components/ReportButton';
import type { Comment } from '@/types/database';

export default function CommentSection({ bookId, userId }: { bookId: string; userId: string | null }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function load() {
    const { data } = await supabase
      .from('comments')
      .select('*, author:profiles(username, display_name, avatar_url)')
      .eq('book_id', bookId)
      .is('chapter_id', null)
      .order('created_at', { ascending: false });
    setComments((data as unknown as Comment[]) ?? []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !text.trim()) return;
    setLoading(true);
    await supabase.from('comments').insert({
      book_id: bookId,
      user_id: userId,
      content: filterProfanity(text.trim()),
    });
    setText('');
    await load();
    setLoading(false);
  }

  return (
    <div>
      <h2 className="mb-4 font-display text-lg text-parchment-100">Пікірлер ({comments.length})</h2>

      {userId ? (
        <form onSubmit={submit} className="mb-6 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Пікіріңізді жазыңыз..."
            className="focus-ring w-full rounded-md border border-night-600 bg-night-900 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="focus-ring shrink-0 rounded-md bg-ember-500 px-4 py-2 text-sm font-medium text-night-950 hover:bg-ember-400"
          >
            Жіберу
          </button>
        </form>
      ) : (
        <p className="mb-6 text-sm text-parchment-200/50">Пікір қалдыру үшін жүйеге кіріңіз.</p>
      )}

      <ul className="flex flex-col gap-4">
        {comments.map((c) => (
          <li key={c.id} className="border-b border-night-800 pb-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-parchment-100">
                {c.author?.display_name ?? c.author?.username}
              </p>
              <ReportButton contentType="comment" contentId={c.id} userId={userId} />
            </div>
            <p className="mt-1 text-sm text-parchment-200/80">{c.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

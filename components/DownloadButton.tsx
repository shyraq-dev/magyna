'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { saveBookOffline, isBookOffline, deleteBookOffline } from '@/lib/offline';

export default function DownloadButton({
  bookId,
  title,
  coverUrl,
  authorName,
}: {
  bookId: string;
  title: string;
  coverUrl: string | null;
  authorName: string | null;
}) {
  const [status, setStatus] = useState<'idle' | 'downloading' | 'saved'>('idle');
  const supabase = createClient();

  useEffect(() => {
    isBookOffline(bookId).then((saved) => setStatus(saved ? 'saved' : 'idle'));
  }, [bookId]);

  async function download() {
    setStatus('downloading');
    const { data: chapters } = await supabase
      .from('chapters')
      .select('id, book_id, title, content, order_index')
      .eq('book_id', bookId)
      .eq('status', 'published')
      .order('order_index');

    await saveBookOffline(
      { id: bookId, title, cover_url: coverUrl, author_name: authorName, downloaded_at: new Date().toISOString() },
      chapters ?? []
    );
    setStatus('saved');
  }

  async function remove() {
    await deleteBookOffline(bookId);
    setStatus('idle');
  }

  if (status === 'saved') {
    return (
      <button
        onClick={remove}
        className="focus-ring rounded-full border border-steppe-500 px-4 py-1.5 text-sm text-steppe-400 hover:bg-steppe-500/10"
      >
        ✓ Офлайн жүктелген · өшіру
      </button>
    );
  }

  return (
    <button
      onClick={download}
      disabled={status === 'downloading'}
      className="focus-ring rounded-full border border-night-600 px-4 py-1.5 text-sm text-parchment-200 hover:border-ember-500 disabled:opacity-60"
    >
      {status === 'downloading' ? 'Жүктелуде...' : '⬇ Офлайн оқу үшін жүктеу'}
    </button>
  );
}

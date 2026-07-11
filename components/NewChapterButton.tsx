'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function NewChapterButton({ bookId, nextOrder }: { bookId: string; nextOrder: number }) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  async function create() {
    setLoading(true);
    const { data } = await supabase
      .from('chapters')
      .insert({ book_id: bookId, title: `${nextOrder + 1}-тарау`, order_index: nextOrder, content: '' })
      .select()
      .single();
    setLoading(false);
    if (data) router.push(`/write/${bookId}/chapters/${data.id}`);
  }

  return (
    <button
      onClick={create}
      disabled={loading}
      className="focus-ring rounded-full border border-night-600 px-4 py-1.5 text-sm hover:border-ember-500"
    >
      + Тарау қосу
    </button>
  );
}

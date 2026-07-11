'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function PublishToggle({ bookId, status }: { bookId: string; status: string }) {
  const [current, setCurrent] = useState(status);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  async function toggle() {
    setLoading(true);
    const next = current === 'published' ? 'draft' : 'published';
    await supabase.from('books').update({ status: next, updated_at: new Date().toISOString() }).eq('id', bookId);
    setCurrent(next);
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`focus-ring shrink-0 rounded-full px-4 py-1.5 text-sm font-medium ${
        current === 'published'
          ? 'border border-steppe-500 text-steppe-400'
          : 'bg-ember-500 text-night-950 hover:bg-ember-400'
      }`}
    >
      {current === 'published' ? '✓ Жарияланған' : 'Жариялау'}
    </button>
  );
}

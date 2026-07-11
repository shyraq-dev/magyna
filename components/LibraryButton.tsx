'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LibraryButton({ bookId, userId }: { bookId: string; userId: string | null }) {
  const [inLibrary, setInLibrary] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (!userId) return;
    supabase
      .from('library')
      .select('book_id')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .maybeSingle()
      .then(({ data }) => setInLibrary(!!data));
  }, [userId, bookId, supabase]);

  async function toggle() {
    if (!userId) {
      router.push('/login');
      return;
    }
    setLoading(true);
    if (inLibrary) {
      await supabase.from('library').delete().eq('user_id', userId).eq('book_id', bookId);
    } else {
      await supabase.from('library').insert({ user_id: userId, book_id: bookId });
    }
    setInLibrary(!inLibrary);
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`focus-ring rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
        inLibrary
          ? 'bg-ember-500/20 text-ember-400'
          : 'border border-night-600 text-parchment-200 hover:border-ember-500'
      }`}
    >
      {inLibrary ? '✓ Таңдаулыда' : '+ Таңдаулыға қосу'}
    </button>
  );
}

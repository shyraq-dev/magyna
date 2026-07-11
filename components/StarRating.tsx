'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function StarRating({ bookId, userId }: { bookId: string; userId: string | null }) {
  const [avg, setAvg] = useState<number | null>(null);
  const [count, setCount] = useState(0);
  const [myScore, setMyScore] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const supabase = createClient();

  async function load() {
    const { data } = await supabase.from('ratings').select('score').eq('book_id', bookId);
    if (data && data.length > 0) {
      setAvg(data.reduce((s, r) => s + r.score, 0) / data.length);
      setCount(data.length);
    } else {
      setAvg(null);
      setCount(0);
    }
    if (userId) {
      const { data: mine } = await supabase
        .from('ratings')
        .select('score')
        .eq('book_id', bookId)
        .eq('user_id', userId)
        .maybeSingle();
      setMyScore(mine?.score ?? null);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId, userId]);

  async function rate(score: number) {
    if (!userId) return;
    await supabase.from('ratings').upsert({ user_id: userId, book_id: bookId, score });
    setMyScore(score);
    load();
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            disabled={!userId}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(null)}
            onClick={() => rate(n)}
            className={`focus-ring text-lg transition-colors ${
              n <= (hover ?? myScore ?? Math.round(avg ?? 0))
                ? 'text-ember-400'
                : 'text-parchment-200/25'
            } ${userId ? 'cursor-pointer' : 'cursor-default'}`}
            aria-label={`${n} жұлдыз`}
          >
            ★
          </button>
        ))}
      </div>
      <span className="text-xs text-parchment-200/50">
        {avg ? `${avg.toFixed(1)} (${count})` : 'Рейтинг жоқ'}
      </span>
    </div>
  );
}

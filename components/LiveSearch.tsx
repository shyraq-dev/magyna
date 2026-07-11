'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

type Result = { id: string; title: string; cover_url: string | null };

export default function LiveSearch({ defaultValue }: { defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue ?? '');
  const [results, setResults] = useState<Result[]>([]);
  const [open, setOpen] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('click', onClickOutside);
    return () => document.removeEventListener('click', onClickOutside);
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const { data } = await supabase
        .from('books')
        .select('id, title, cover_url')
        .eq('status', 'published')
        .ilike('title', `%${value.trim()}%`)
        .limit(6);
      setResults(data ?? []);
      setOpen(true);
    }, 250);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setOpen(false);
    router.push(value ? `/?q=${encodeURIComponent(value)}` : '/');
  }

  return (
    <div ref={containerRef} className="relative">
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Кітап атауы, автор немесе жанр..."
          className="focus-ring w-full rounded-full border border-night-600 bg-night-900 px-4 py-2 text-sm text-parchment-100 placeholder:text-parchment-200/40"
        />
        <button
          type="submit"
          className="focus-ring shrink-0 rounded-full bg-ember-500 px-4 py-2 text-sm font-medium text-night-950 hover:bg-ember-400"
        >
          Іздеу
        </button>
      </form>

      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-12 z-30 overflow-hidden rounded-lg border border-night-700 bg-night-900 shadow-xl">
          {results.map((r) => (
            <Link
              key={r.id}
              href={`/books/${r.id}`}
              onClick={() => setOpen(false)}
              className="focus-ring flex items-center gap-3 border-b border-night-800 px-4 py-2 last:border-0 hover:bg-night-800"
            >
              <div className="h-10 w-7 shrink-0 overflow-hidden rounded bg-night-800">
                {r.cover_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.cover_url} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <span className="text-sm text-parchment-100">{r.title}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

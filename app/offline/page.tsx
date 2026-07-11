'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getOfflineBooks, deleteBookOffline, type OfflineBook } from '@/lib/offline';

export default function OfflinePage() {
  const [books, setBooks] = useState<OfflineBook[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setBooks(await getOfflineBooks());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id: string) {
    await deleteBookOffline(id);
    load();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-2 font-display text-3xl text-parchment-100">Офлайн кітапхана</h1>
      <p className="mb-8 text-sm text-parchment-200/60">
        Мұнда құрылғыңызға жүктеп алған кітаптар сақталады — интернет болмаса да оқи аласыз.
      </p>

      {loading ? (
        <p className="text-sm text-parchment-200/50">Жүктелуде...</p>
      ) : books.length === 0 ? (
        <p className="text-sm text-parchment-200/50">
          Әзірге офлайн кітап жоқ. Кез келген кітап бетінде «Офлайн оқу үшін жүктеу» батырмасын басыңыз.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {books.map((b) => (
            <li
              key={b.id}
              className="flex items-center gap-4 rounded-lg border border-night-700 bg-night-900 p-4"
            >
              <div className="h-16 w-12 shrink-0 overflow-hidden rounded bg-night-800">
                {b.cover_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.cover_url} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="flex-1">
                <Link href={`/offline/${b.id}`} className="focus-ring font-display text-lg text-parchment-100">
                  {b.title}
                </Link>
                <p className="text-xs text-parchment-200/50">{b.author_name}</p>
              </div>
              <button
                onClick={() => remove(b.id)}
                className="focus-ring rounded-full border border-night-600 px-3 py-1 text-xs text-parchment-200/70 hover:border-red-400 hover:text-red-400"
              >
                Өшіру
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

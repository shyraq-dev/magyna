'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getOfflineChapters, type OfflineChapter } from '@/lib/offline';
import { parseParagraphs } from '@/lib/paragraphs';

const THEMES = [
  { id: 'reader-dark', label: 'Қараңғы' },
  { id: 'reader-sepia', label: 'Сепия' },
  { id: 'reader-light', label: 'Ақ' },
] as const;

export default function OfflineBookReaderPage() {
  const params = useParams<{ bookId: string }>();
  const searchParams = useSearchParams();
  const [chapters, setChapters] = useState<OfflineChapter[]>([]);
  const [fontSize, setFontSize] = useState(18);
  const [theme, setTheme] = useState<(typeof THEMES)[number]['id']>('reader-dark');

  useEffect(() => {
    getOfflineChapters(params.bookId).then(setChapters);
  }, [params.bookId]);

  const activeId = searchParams.get('chapter') ?? chapters[0]?.id;
  const active = chapters.find((c) => c.id === activeId) ?? chapters[0];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <p className="mb-6 text-xs uppercase tracking-widest text-ember-400/80">Офлайн режим</p>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
        <aside>
          <h2 className="mb-3 font-display text-lg text-parchment-100">Тараулар</h2>
          <ul className="flex flex-col gap-1">
            {chapters.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/offline/${params.bookId}?chapter=${c.id}`}
                  className={`focus-ring block rounded px-2 py-1.5 text-sm ${
                    c.id === active?.id
                      ? 'bg-ember-500/20 text-ember-400'
                      : 'text-parchment-200/70 hover:bg-night-800'
                  }`}
                >
                  {c.order_index + 1}. {c.title}
                </Link>
              </li>
            ))}
            {chapters.length === 0 && (
              <p className="text-sm text-parchment-200/50">Тараулар табылмады.</p>
            )}
          </ul>
        </aside>

        <div>
          {active ? (
            <div className={`${theme} rounded-lg transition-colors`}>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-4 py-3 text-sm">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFontSize((s) => Math.max(14, s - 1))}
                    className="focus-ring h-8 w-8 rounded-full border border-current/20"
                  >
                    A-
                  </button>
                  <span className="w-8 text-center">{fontSize}</span>
                  <button
                    onClick={() => setFontSize((s) => Math.min(28, s + 1))}
                    className="focus-ring h-8 w-8 rounded-full border border-current/20"
                  >
                    A+
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`focus-ring rounded-full border px-3 py-1 ${
                        theme === t.id ? 'border-current' : 'border-current/20 opacity-60'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="prose-reader mx-auto max-w-2xl px-6 py-10" style={{ fontSize }}>
                <h1 className="mb-6 font-display text-3xl">{active.title}</h1>
                {parseParagraphs(active.content).map((p, i) => (
                  <p key={i} className="mb-5" dangerouslySetInnerHTML={{ __html: p }} />
                ))}
              </div>
            </div>
          ) : (
            <p className="text-parchment-200/60">Бұл кітап әлі жүктелмеген.</p>
          )}
        </div>
      </div>
    </div>
  );
}

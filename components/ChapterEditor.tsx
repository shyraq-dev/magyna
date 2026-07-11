'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { countWords } from '@/lib/text';
import RichTextEditor from '@/components/RichTextEditor';
import type { Chapter } from '@/types/database';

export default function ChapterEditor({ chapter, bookId }: { chapter: Chapter; bookId: string }) {
  const [title, setTitle] = useState(chapter.title);
  const [content, setContent] = useState(chapter.content);
  const [status, setStatus] = useState(chapter.status);
  const [scheduledAt, setScheduledAt] = useState(
    chapter.scheduled_at ? chapter.scheduled_at.slice(0, 16) : ''
  );
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const supabase = createClient();
  const router = useRouter();
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const wordCount = countWords(content);

  // Автосақтау (черновик) — әр 5-10 секунд сайын
  useEffect(() => {
    clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      await supabase
        .from('chapters')
        .update({ title, content, word_count: wordCount, updated_at: new Date().toISOString() })
        .eq('id', chapter.id);
      setSavedAt(new Date());
    }, 6000);
    return () => clearTimeout(saveTimeout.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content]);

  async function togglePublish() {
    const next = status === 'published' ? 'draft' : 'published';
    await supabase.from('chapters').update({ status: next, scheduled_at: null }).eq('id', chapter.id);
    setStatus(next);
    setScheduledAt('');
  }

  async function saveSchedule() {
    if (!scheduledAt) return;
    await supabase
      .from('chapters')
      .update({ scheduled_at: new Date(scheduledAt).toISOString(), status: 'draft' })
      .eq('id', chapter.id);
    setStatus('draft');
  }

  async function cancelSchedule() {
    await supabase.from('chapters').update({ scheduled_at: null }).eq('id', chapter.id);
    setScheduledAt('');
  }

  async function deleteChapter() {
    if (!confirm('Тарауды өшіру керек пе? Бұл әрекетті болдырмау мүмкін емес.')) return;
    await supabase.from('chapters').delete().eq('id', chapter.id);
    router.push(`/write/${bookId}`);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="focus-ring w-full rounded-md border border-night-600 bg-night-900 px-3 py-2 font-display text-lg"
        />
        <button
          onClick={togglePublish}
          className={`focus-ring shrink-0 rounded-full px-4 py-1.5 text-sm font-medium ${
            status === 'published'
              ? 'border border-steppe-500 text-steppe-400'
              : 'bg-ember-500 text-night-950 hover:bg-ember-400'
          }`}
        >
          {status === 'published' ? '✓ Жарияланған' : 'Жариялау'}
        </button>
      </div>

      <RichTextEditor value={content} onChange={setContent} placeholder="Тарау мәтінін осында жазыңыз..." />

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-parchment-200/40">
        <span>
          {wordCount} сөз · {savedAt ? `сақталды: ${savedAt.toLocaleTimeString('kk-KZ')}` : 'сақталуда...'}
        </span>
        <button onClick={deleteChapter} className="focus-ring text-red-400 hover:underline">
          Тарауды өшіру
        </button>
      </div>

      {status !== 'published' && (
        <div className="mt-6 rounded-md border border-night-700 bg-night-900 p-4">
          <p className="mb-2 text-sm font-medium text-parchment-100">Жоспарлы жариялау</p>
          <p className="mb-3 text-xs text-parchment-200/50">
            Күн мен уақыт белгілесеңіз, тарау сол сәтте автоматты түрде жарияланады.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="focus-ring rounded-md border border-night-600 bg-night-950 px-3 py-2 text-sm"
            />
            <button
              onClick={saveSchedule}
              className="focus-ring rounded-full border border-ember-500 px-4 py-1.5 text-sm text-ember-400 hover:bg-ember-500/10"
            >
              Жоспарлау
            </button>
            {chapter.scheduled_at && (
              <button
                onClick={cancelSchedule}
                className="focus-ring rounded-full border border-night-600 px-4 py-1.5 text-sm text-parchment-200/70 hover:border-red-400"
              >
                Болдырмау
              </button>
            )}
          </div>
          {chapter.scheduled_at && (
            <p className="mt-2 text-xs text-steppe-400">
              Жоспарланған: {new Date(chapter.scheduled_at).toLocaleString('kk-KZ')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { parseParagraphs } from '@/lib/paragraphs';
import { generateQuoteImage } from '@/lib/quoteImage';
import { filterProfanity } from '@/lib/contentFilter';
import type { Chapter } from '@/types/database';

const THEMES = [
  { id: 'reader-dark', label: 'Қараңғы' },
  { id: 'reader-sepia', label: 'Сепия' },
  { id: 'reader-light', label: 'Ақ' },
] as const;

const FONTS = [
  { id: 'font-read-serif', label: 'Charter', family: '"Charter", Georgia, serif' },
  { id: 'font-read-sans', label: 'Inter', family: '"Inter", system-ui, sans-serif' },
  { id: 'font-read-merri', label: 'Merriweather', family: '"Merriweather", Georgia, serif' },
] as const;

export default function Reader({
  chapter,
  bookId,
  bookTitle,
  userId,
  initialScroll,
  chapters,
}: {
  chapter: Chapter;
  bookId: string;
  bookTitle: string;
  userId: string | null;
  initialScroll: number;
  chapters: { id: string; title: string; order_index: number }[];
}) {
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState(1.85);
  const [fontFamily, setFontFamily] = useState<(typeof FONTS)[number]['family']>(FONTS[0].family);
  const [theme, setTheme] = useState<(typeof THEMES)[number]['id']>('reader-dark');
  const [showChrome, setShowChrome] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [selectionToolbar, setSelectionToolbar] = useState<{ x: number; y: number; text: string } | null>(
    null
  );
  const [activeParagraph, setActiveParagraph] = useState<number | null>(null);
  const [paragraphComments, setParagraphComments] = useState<Record<number, any[]>>({});
  const [commentDraft, setCommentDraft] = useState('');
  const [liked, setLiked] = useState(false);
  const [visibleCount, setVisibleCount] = useState(40);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const paragraphs = parseParagraphs(chapter.content);
  const visibleParagraphs = paragraphs.slice(0, visibleCount);
  const currentIndex = chapters.findIndex((c) => c.id === chapter.id);
  const nextChapter = chapters[currentIndex + 1];

  // Ұзақ тарауларды бөлшектеп жүктеу (Lazy loading)
  useEffect(() => {
    setVisibleCount(40);
  }, [chapter.id]);

  useEffect(() => {
    if (!sentinelRef.current || visibleCount >= paragraphs.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setVisibleCount((c) => Math.min(paragraphs.length, c + 40));
      },
      { rootMargin: '400px' }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [visibleCount, paragraphs.length]);

  useEffect(() => {
    if (initialScroll > 0) window.scrollTo({ top: initialScroll });
  }, [initialScroll]);

  useEffect(() => {
    if (!userId) return;
    let timeout: ReturnType<typeof setTimeout>;
    function onScroll() {
      clearTimeout(timeout);
      timeout = setTimeout(async () => {
        await supabase.from('reading_progress').upsert({
          user_id: userId,
          book_id: bookId,
          chapter_id: chapter.id,
          scroll_position: window.scrollY,
          updated_at: new Date().toISOString(),
        });
      }, 1200);
    }
    window.addEventListener('scroll', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(timeout);
    };
  }, [userId, bookId, chapter.id, supabase]);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from('chapter_likes')
      .select('user_id')
      .eq('chapter_id', chapter.id)
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => setLiked(!!data));
  }, [chapter.id, userId, supabase]);

  function handleMouseUp() {
    const selection = window.getSelection();
    const text = selection?.toString().trim() ?? '';
    if (text.length > 8 && containerRef.current?.contains(selection?.anchorNode ?? null)) {
      const range = selection!.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectionToolbar({ x: rect.left + rect.width / 2, y: rect.top + window.scrollY - 40, text });
    } else {
      setSelectionToolbar(null);
    }
  }

  function handleCopy(e: React.ClipboardEvent) {
    e.preventDefault();
    alert('Мәтінді тікелей көшіруге болмайды. Белгілеп, «Дәйексөз» батырмасын басып бөлісіңіз.');
  }

  async function saveQuote() {
    if (!selectionToolbar || !userId) return;
    await supabase.from('quotes').insert({
      user_id: userId,
      chapter_id: chapter.id,
      book_id: bookId,
      text_snippet: selectionToolbar.text,
    });
    const dataUrl = generateQuoteImage(selectionToolbar.text, bookTitle);

    // Мобильде тікелей бөлісу (Instagram/TikTok сторис және т.б.)
    if (navigator.share && navigator.canShare) {
      try {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], 'magyna-quote.png', { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: bookTitle });
          setSelectionToolbar(null);
          return;
        }
      } catch {
        // бөлісу тоқтатылса — жүктеп алуға көшеміз
      }
    }

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'magyna-quote.png';
    link.click();
    setSelectionToolbar(null);
  }

  async function toggleLike() {
    if (!userId) return;
    if (liked) {
      await supabase.from('chapter_likes').delete().eq('chapter_id', chapter.id).eq('user_id', userId);
      await supabase
        .from('chapters')
        .update({ likes_count: Math.max(0, chapter.likes_count - 1) })
        .eq('id', chapter.id);
    } else {
      await supabase.from('chapter_likes').insert({ chapter_id: chapter.id, user_id: userId });
      await supabase.from('chapters').update({ likes_count: chapter.likes_count + 1 }).eq('id', chapter.id);
    }
    setLiked(!liked);
  }

  async function loadParagraphComments(index: number) {
    const { data } = await supabase
      .from('comments')
      .select('*, author:profiles(username, display_name)')
      .eq('chapter_id', chapter.id)
      .eq('paragraph_index', index)
      .order('created_at', { ascending: false });
    setParagraphComments((prev) => ({ ...prev, [index]: data ?? [] }));
  }

  function openParagraph(index: number) {
    setActiveParagraph(index);
    setShowChrome(true);
    if (!paragraphComments[index]) loadParagraphComments(index);
  }

  async function submitParagraphComment() {
    if (!userId || activeParagraph === null || !commentDraft.trim()) return;
    await supabase.from('comments').insert({
      book_id: bookId,
      chapter_id: chapter.id,
      paragraph_index: activeParagraph,
      user_id: userId,
      content: filterProfanity(commentDraft.trim()),
    });
    setCommentDraft('');
    loadParagraphComments(activeParagraph);
  }

  return (
    <div className={`${theme} relative rounded-lg transition-colors`}>
      {showChrome && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-4 py-3 text-sm">
          <button
            onClick={() => setShowSettings((s) => !s)}
            className="focus-ring rounded-full border border-current/20 px-3 py-1"
          >
            Aa баптаулар
          </button>
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
      )}

      {showSettings && (
        <div className="flex flex-col gap-3 border-b border-black/10 px-4 py-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-24 opacity-70">Қаріп өлшемі</span>
            <button
              onClick={() => setFontSize((s) => Math.max(12, s - 1))}
              className="focus-ring h-7 w-7 rounded-full border border-current/20"
            >
              A-
            </button>
            <span className="w-8 text-center">{fontSize}</span>
            <button
              onClick={() => setFontSize((s) => Math.min(28, s + 1))}
              className="focus-ring h-7 w-7 rounded-full border border-current/20"
            >
              A+
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-24 opacity-70">Жол аралығы</span>
            <input
              type="range"
              min={1.4}
              max={2.4}
              step={0.1}
              value={lineHeight}
              onChange={(e) => setLineHeight(Number(e.target.value))}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-24 opacity-70">Қаріп</span>
            <div className="flex gap-2">
              {FONTS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFontFamily(f.family)}
                  className={`focus-ring rounded-full border px-3 py-1 text-xs ${
                    fontFamily === f.family ? 'border-current' : 'border-current/20 opacity-60'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        onMouseUp={handleMouseUp}
        onCopy={handleCopy}
        onContextMenu={(e) => e.preventDefault()}
        onClick={(e) => {
          if (e.target === containerRef.current) setShowChrome((s) => !s);
        }}
        className="mx-auto max-w-2xl select-text px-6 py-10"
        style={{ fontSize, lineHeight, fontFamily }}
      >
        <h1 className="mb-6 font-display text-3xl">{chapter.title}</h1>

        {visibleParagraphs.map((p, i) => (
          <p
            key={i}
            onClick={() => openParagraph(i)}
            className="prose-reader mb-5 cursor-pointer rounded px-1 transition-colors hover:bg-ember-500/5"
            dangerouslySetInnerHTML={{ __html: p }}
          />
        ))}

        {visibleCount < paragraphs.length && (
          <div ref={sentinelRef} className="py-4 text-center text-xs opacity-40">
            Жүктелуде...
          </div>
        )}

        {activeParagraph !== null && (
          <div className="my-6 rounded-md border border-current/10 bg-black/10 p-4 text-sm">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-medium">Абзацқа пікірлер</p>
              <button onClick={() => setActiveParagraph(null)} className="focus-ring opacity-60">
                ×
              </button>
            </div>
            {userId ? (
              <div className="mb-3 flex gap-2">
                <input
                  value={commentDraft}
                  onChange={(e) => setCommentDraft(e.target.value)}
                  placeholder="Осы абзацқа пікір жазыңыз..."
                  className="focus-ring w-full rounded border border-current/20 bg-transparent px-2 py-1"
                />
                <button
                  onClick={submitParagraphComment}
                  className="focus-ring shrink-0 rounded bg-ember-500 px-3 py-1 text-night-950"
                >
                  Жіберу
                </button>
              </div>
            ) : (
              <p className="mb-3 opacity-60">Пікір қалдыру үшін жүйеге кіріңіз.</p>
            )}
            <ul className="flex flex-col gap-2">
              {(paragraphComments[activeParagraph] ?? []).map((c) => (
                <li key={c.id}>
                  <span className="font-medium">{c.author?.display_name ?? c.author?.username}: </span>
                  <span className="opacity-80">{c.content}</span>
                </li>
              ))}
              {(paragraphComments[activeParagraph] ?? []).length === 0 && (
                <li className="opacity-50">Әлі пікір жоқ — бірінші болыңыз.</li>
              )}
            </ul>
          </div>
        )}

        <div className="mt-10 flex items-center justify-between border-t border-current/10 pt-6">
          <button
            onClick={toggleLike}
            disabled={!userId}
            className={`focus-ring rounded-full border px-4 py-2 text-sm ${
              liked ? 'border-ember-500 bg-ember-500/20 text-ember-500' : 'border-current/20'
            }`}
          >
            {liked ? '♥ Ұнады' : '♡ Ұнату'}
          </button>
          {nextChapter ? (
            <Link
              href={`/books/${bookId}?chapter=${nextChapter.id}`}
              className="focus-ring rounded-full bg-ember-500 px-4 py-2 text-sm font-medium text-night-950 hover:bg-ember-400"
            >
              Келесі тарау →
            </Link>
          ) : (
            <span className="text-sm opacity-50">Соңғы тарау</span>
          )}
        </div>
      </div>

      {selectionToolbar && userId && (
        <button
          onClick={saveQuote}
          style={{ position: 'absolute', left: selectionToolbar.x, top: selectionToolbar.y }}
          className="focus-ring -translate-x-1/2 rounded-full bg-ember-500 px-3 py-1.5 text-xs font-medium text-night-950 shadow-lg"
        >
          ✂ Дәйексөз сақтау
        </button>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import MarkdownEditor from "@/components/admin/MarkdownEditor";
import { useDraftAutosave } from "@/components/admin/useDraftAutosave";
import DraftStatus from "@/components/admin/DraftStatus";

export default function ChapterForm({
  bookId,
  bookTitle,
  bookSlug,
  bookStatus,
  nextChapterNumber,
}: {
  bookId: string;
  bookTitle: string;
  bookSlug: string;
  bookStatus: "draft" | "published";
  nextChapterNumber: number;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { savedAt, restoredAt, clearDraft } = useDraftAutosave(
    `magyna:draft:new-chapter:${bookId}`,
    title,
    content,
    (draft) => {
      setTitle(draft.title);
      setContent(draft.content);
    }
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.from("chapters").insert({
      book_id: bookId,
      chapter_number: nextChapterNumber,
      title,
      content,
    });

    if (error) {
      setLoading(false);
      setError("Сақтау кезінде қате шықты. Қайталап көріңіз.");
      return;
    }

    // If the book is already public, let its shelf-subscribers know.
    if (bookStatus === "published") {
      fetch("/api/push/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId,
          title: bookTitle,
          body: `${nextChapterNumber}-тарау: ${title}`,
          url: `/kitaptar/${bookSlug}/${nextChapterNumber}`,
        }),
      }).catch(() => {});
    }

    clearDraft();
    setLoading(false);
    setTitle("");
    setContent("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted">{nextChapterNumber}-тарау</div>
        <DraftStatus savedAt={savedAt} restoredAt={restoredAt} />
      </div>

      {restoredAt && (
        <div className="flex items-center justify-between rounded-sm border border-gold-500 bg-gold-300/10 px-4 py-2 text-sm">
          <span>Сақталмаған жоба қалпына келтірілді.</span>
          <button
            type="button"
            onClick={() => {
              clearDraft();
              setTitle("");
              setContent("");
            }}
            className="text-muted underline hover:text-red-700"
          >
            Тастау
          </button>
        </div>
      )}

      <div>
        <label htmlFor="chapter-title" className="block text-sm">
          Тарау атауы
        </label>
        <input
          id="chapter-title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 input"
        />
      </div>
      <div>
        <label htmlFor="chapter-content" className="block text-sm">
          Мәтін
        </label>
        <div className="mt-1">
          <MarkdownEditor id="chapter-content" value={content} onChange={setContent} />
        </div>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary disabled:opacity-60"
      >
        {loading ? "Сақталуда..." : "Тарауды қосу"}
      </button>
    </form>
  );
}

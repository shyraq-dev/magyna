"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ReadingTracker({
  userId,
  bookId,
  chapterId,
  isLastChapter,
}: {
  userId: string;
  bookId: string;
  chapterId: string;
  /** Whether this is the book's final chapter — reaching the end of it
   *  marks the book "finished" (feeds the Марафоншы badge). */
  isLastChapter?: boolean;
}) {
  const supabase = createClient();
  const lastSaved = useRef(0);
  const markedFinished = useRef(false);

  useEffect(() => {
    function onScroll() {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      const position = scrollable > 0 ? doc.scrollTop / scrollable : 1;

      // Save at most once every ~2s of scroll movement to avoid write spam.
      if (Math.abs(position - lastSaved.current) < 0.02) return;
      lastSaved.current = position;

      const payload: Record<string, unknown> = {
        user_id: userId,
        book_id: bookId,
        chapter_id: chapterId,
        position,
        updated_at: new Date().toISOString(),
      };

      // Only ever set finished_at (never clear it) — upsert only
      // touches the columns present in the payload, so omitting this
      // key on ordinary scroll updates leaves any existing value alone.
      if (isLastChapter && position >= 0.95 && !markedFinished.current) {
        markedFinished.current = true;
        payload.finished_at = new Date().toISOString();
      }

      supabase.from("reading_progress").upsert(payload).then();
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [bookId, chapterId, isLastChapter, supabase, userId]);

  return null;
}

"use client";

import { useEffect, useRef, useState } from "react";

type Draft = { title: string; content: string; savedAt: number };

/**
 * Debounced localStorage autosave for a chapter title/content pair.
 * Restores any existing draft once on mount (via onRestore) and keeps
 * saving as the person types, so a lost connection or an accidentally
 * closed tab doesn't lose the work. Call clearDraft() after a
 * successful save to the database.
 */
export function useDraftAutosave(
  key: string,
  title: string,
  content: string,
  onRestore: (draft: { title: string; content: string }) => void
) {
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [restoredAt, setRestoredAt] = useState<number | null>(null);
  const didRestore = useRef(false);

  useEffect(() => {
    if (didRestore.current) return;
    didRestore.current = true;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const draft: Draft = JSON.parse(raw);
        if (draft.title || draft.content) {
          onRestore({ title: draft.title, content: draft.content });
          setRestoredAt(draft.savedAt);
        }
      }
    } catch {
      // localStorage unavailable (e.g. private mode) — autosave simply
      // won't have anything to restore; not worth surfacing an error.
    }
    // Restore exactly once, regardless of onRestore identity churn.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!title && !content) return;
    const timeout = setTimeout(() => {
      try {
        const draft: Draft = { title, content, savedAt: Date.now() };
        localStorage.setItem(key, JSON.stringify(draft));
        setSavedAt(draft.savedAt);
      } catch {
        // ignore — see note above
      }
    }, 1000);
    return () => clearTimeout(timeout);
  }, [key, title, content]);

  function clearDraft() {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
    setSavedAt(null);
    setRestoredAt(null);
  }

  return { savedAt, restoredAt, clearDraft };
}

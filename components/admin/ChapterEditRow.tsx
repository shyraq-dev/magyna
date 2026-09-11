"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import MarkdownEditor from "@/components/admin/MarkdownEditor";
import { useDraftAutosave } from "@/components/admin/useDraftAutosave";
import DraftStatus from "@/components/admin/DraftStatus";

export default function ChapterEditRow({
  chapterId,
  initialTitle,
  initialContent,
  onSaved,
}: {
  chapterId: string;
  initialTitle: string;
  initialContent: string;
  onSaved: (title: string, content: string) => void;
}) {
  const supabase = createClient();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);

  const { savedAt, restoredAt, clearDraft } = useDraftAutosave(
    `magyna:draft:edit-chapter:${chapterId}`,
    title,
    content,
    (draft) => {
      setTitle(draft.title);
      setContent(draft.content);
    }
  );

  async function save() {
    setSaving(true);
    const { error } = await supabase
      .from("chapters")
      .update({ title, content })
      .eq("id", chapterId);
    setSaving(false);
    if (!error) {
      clearDraft();
      onSaved(title, content);
    }
  }

  return (
    <div className="mt-3 space-y-3">
      {restoredAt && (
        <div className="flex items-center justify-between rounded-sm border border-gold-500 bg-gold-300/10 px-4 py-2 text-sm">
          <span>Сақталмаған өзгеріс қалпына келтірілді.</span>
          <button
            type="button"
            onClick={() => {
              clearDraft();
              setTitle(initialTitle);
              setContent(initialContent);
            }}
            className="text-muted underline hover:text-red-700"
          >
            Тастау
          </button>
        </div>
      )}

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="input"
      />
      <MarkdownEditor id={`chapter-edit-${chapterId}`} value={content} onChange={setContent} />

      <div className="flex items-center gap-4">
        <button
          onClick={save}
          disabled={saving}
          className="btn-primary text-sm disabled:opacity-60"
        >
          {saving ? "Сақталуда..." : "Сақтау"}
        </button>
        <DraftStatus savedAt={savedAt} restoredAt={restoredAt} />
      </div>
    </div>
  );
}

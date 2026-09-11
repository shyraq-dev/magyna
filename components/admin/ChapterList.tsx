"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ChapterEditRow from "@/components/admin/ChapterEditRow";

type Chapter = {
  id: string;
  chapter_number: number;
  title: string;
  content: string;
};

export default function ChapterList({ chapters }: { chapters: Chapter[] }) {
  const supabase = createClient();
  const [items, setItems] = useState(chapters);
  const [openId, setOpenId] = useState<string | null>(null);

  async function remove(id: string) {
    const ok = window.confirm("Бұл тарауды жою керек пе? Бұл әрекетті қайтару мүмкін емес.");
    if (!ok) return;
    const { error } = await supabase.from("chapters").delete().eq("id", id);
    if (!error) setItems(items.filter((c) => c.id !== id));
  }

  if (items.length === 0) {
    return <p className="mt-4 text-muted">Тараулар әлі қосылмаған.</p>;
  }

  return (
    <ol className="mt-4 divide-y divide-line">
      {items.map((c) => (
        <li key={c.id} className="py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setOpenId(openId === c.id ? null : c.id)}
              className="text-left hover:text-gold-600"
            >
              {c.chapter_number}-тарау. {c.title}
            </button>
            <div className="flex gap-4 text-sm">
              <button
                onClick={() => setOpenId(openId === c.id ? null : c.id)}
                className="text-muted hover:text-gold-600"
              >
                {openId === c.id ? "Жабу" : "Өңдеу"}
              </button>
              <button
                onClick={() => remove(c.id)}
                className="text-muted hover:text-red-700"
              >
                Жою
              </button>
            </div>
          </div>

          {openId === c.id && (
            <ChapterEditRow
              chapterId={c.id}
              initialTitle={c.title}
              initialContent={c.content}
              onSaved={(title, content) => {
                setItems(
                  items.map((it) =>
                    it.id === c.id ? { ...it, title, content } : it
                  )
                );
                setOpenId(null);
              }}
            />
          )}
        </li>
      ))}
    </ol>
  );
}

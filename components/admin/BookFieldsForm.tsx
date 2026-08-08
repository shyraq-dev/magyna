"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function BookFieldsForm({
  bookId,
  initial,
}: {
  bookId: string;
  initial: { title: string; description: string | null };
}) {
  const router = useRouter();
  const supabase = createClient();
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const { error } = await supabase
      .from("books")
      .update({ title, description: description || null })
      .eq("id", bookId);

    setSaving(false);
    if (error) {
      setError("Сақтау сәтсіз аяқталды. Қайталап көріңіз.");
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={save} className="mt-4 space-y-5">
      <div>
        <label htmlFor="book-title" className="block text-sm">Атауы</label>
        <input
          id="book-title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 input"
        />
      </div>
      <div>
        <label htmlFor="book-description" className="block text-sm">Қысқаша сипаттама</label>
        <textarea
          id="book-description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 input"
        />
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <button type="submit" disabled={saving} className="btn-primary text-sm disabled:opacity-60">
        {saving ? "Сақталуда..." : "Сақтау"}
      </button>
    </form>
  );
}

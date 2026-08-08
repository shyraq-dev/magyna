"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DoramaFieldsForm({
  doramaId,
  initial,
}: {
  doramaId: string;
  initial: {
    title: string;
    genre: string | null;
    synopsis: string | null;
    external_url: string;
    trailer_url: string | null;
  };
}) {
  const router = useRouter();
  const supabase = createClient();
  const [title, setTitle] = useState(initial.title);
  const [genre, setGenre] = useState(initial.genre ?? "");
  const [synopsis, setSynopsis] = useState(initial.synopsis ?? "");
  const [externalUrl, setExternalUrl] = useState(initial.external_url);
  const [trailerUrl, setTrailerUrl] = useState(initial.trailer_url ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const { error } = await supabase
      .from("doramas")
      .update({
        title,
        genre: genre || null,
        synopsis: synopsis || null,
        external_url: externalUrl,
        trailer_url: trailerUrl || null,
      })
      .eq("id", doramaId);

    setSaving(false);
    if (error) {
      setError("Сақтау сәтсіз аяқталды. Қайталап көріңіз.");
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={save} className="mt-6 space-y-5">
      <div>
        <label htmlFor="title" className="block text-sm">Атауы</label>
        <input
          id="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 input"
        />
      </div>
      <div>
        <label htmlFor="genre" className="block text-sm">Жанры</label>
        <input
          id="genre"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="mt-1 input"
        />
      </div>
      <div>
        <label htmlFor="synopsis" className="block text-sm">Қысқаша сипаттама</label>
        <textarea
          id="synopsis"
          rows={4}
          value={synopsis}
          onChange={(e) => setSynopsis(e.target.value)}
          className="mt-1 input"
        />
      </div>
      <div>
        <label htmlFor="external_url" className="block text-sm">«Көру» сілтемесі</label>
        <input
          id="external_url"
          type="url"
          required
          value={externalUrl}
          onChange={(e) => setExternalUrl(e.target.value)}
          className="mt-1 input"
        />
      </div>
      <div>
        <label htmlFor="trailer_url" className="block text-sm">Трейлер сілтемесі</label>
        <input
          id="trailer_url"
          type="url"
          value={trailerUrl}
          onChange={(e) => setTrailerUrl(e.target.value)}
          className="mt-1 input"
        />
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="btn-primary text-sm disabled:opacity-60"
      >
        {saving ? "Сақталуда..." : "Сақтау"}
      </button>
    </form>
  );
}

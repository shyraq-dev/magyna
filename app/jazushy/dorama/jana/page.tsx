"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function slugify(title: string) {
  const map: Record<string, string> = {
    ә: "a", ғ: "g", қ: "q", ң: "n", ө: "o", ұ: "u", ү: "u", һ: "h", і: "i",
  };
  return title
    .toLowerCase()
    .replace(/[әғқңөұүһі]/g, (ch) => map[ch] ?? ch)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function NewDoramaPage() {
  const router = useRouter();
  const supabase = createClient();
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [trailerUrl, setTrailerUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("doramas").insert({
      title,
      genre: genre || null,
      synopsis: synopsis || null,
      external_url: externalUrl,
      trailer_url: trailerUrl || null,
      slug: slugify(title),
      created_by: user.id,
      status: "draft",
    });

    setLoading(false);
    if (error) {
      setError("Сақтау кезінде қате шықты. Қайталап көріңіз.");
      return;
    }
    router.push("/jazushy/dorama");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <Link href="/jazushy/dorama" className="text-sm text-muted hover:text-gold-600">
        ← Дорама тізімі
      </Link>
      <h1 className="mt-4 font-display text-3xl">Жаңа дорама</h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
            placeholder="Романтика, Драма..."
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
          <label htmlFor="external_url" className="block text-sm">
            «Көру» сілтемесі (сыртқы сайт)
          </label>
          <input
            id="external_url"
            type="url"
            required
            placeholder="https://..."
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            className="mt-1 input"
          />
        </div>
        <div>
          <label htmlFor="trailer_url" className="block text-sm">Трейлер сілтемесі (міндетті емес)</label>
          <input
            id="trailer_url"
            type="url"
            placeholder="https://..."
            value={trailerUrl}
            onChange={(e) => setTrailerUrl(e.target.value)}
            className="mt-1 input"
          />
        </div>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3 disabled:opacity-60"
        >
          {loading ? "Сақталуда..." : "Жоба ретінде сақтау"}
        </button>
      </form>
    </div>
  );
}

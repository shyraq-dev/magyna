"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import BookCard from "@/components/BookCard";
import DoramaCard from "@/components/DoramaCard";

type BookResult = { slug: string; title: string; description: string | null; cover_url: string | null };
type DoramaResult = { slug: string; title: string; genre: string | null; cover_url: string | null };

export default function SearchPage() {
  const supabase = createClient();
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState<BookResult[] | null>(null);
  const [doramas, setDoramas] = useState<DoramaResult[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setLoading(true);

    const [{ data: b }, { data: d }] = await Promise.all([
      supabase
        .from("books")
        .select("slug, title, description, cover_url")
        .eq("status", "published")
        .ilike("title", `%${q}%`)
        .limit(12),
      supabase
        .from("doramas")
        .select("slug, title, genre, cover_url")
        .eq("status", "published")
        .ilike("title", `%${q}%`)
        .limit(12),
    ]);

    setBooks(b ?? []);
    setDoramas(d ?? []);
    setLoading(false);
  }

  const searched = books !== null;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-display text-2xl">Іздеу</h1>
      <form onSubmit={search} className="mt-4 flex gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Кітап немесе дорама атауы..."
          className="input flex-1"
          autoFocus
        />
        <button type="submit" disabled={loading} className="btn-primary text-sm disabled:opacity-60">
          {loading ? "..." : "Іздеу"}
        </button>
      </form>

      {searched && (
        <>
          <section className="mt-10">
            <h2 className="font-display text-xl">Кітаптар</h2>
            <div className="mt-4 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
              {books!.length ? (
                books!.map((b) => (
                  <BookCard key={b.slug} slug={b.slug} title={b.title} description={b.description} coverUrl={b.cover_url} />
                ))
              ) : (
                <p className="col-span-full text-muted">Табылмады.</p>
              )}
            </div>
          </section>

          <section className="mt-10">
            <h2 className="font-display text-xl">Дорама</h2>
            <div className="mt-4 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
              {doramas!.length ? (
                doramas!.map((d) => (
                  <DoramaCard key={d.slug} slug={d.slug} title={d.title} genre={d.genre} coverUrl={d.cover_url} />
                ))
              ) : (
                <p className="col-span-full text-muted">Табылмады.</p>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

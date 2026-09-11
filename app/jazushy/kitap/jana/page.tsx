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

export default function NewBookPage() {
  const router = useRouter();
  const supabase = createClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
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

    const { data, error } = await supabase
      .from("books")
      .insert({
        title,
        description,
        slug: slugify(title),
        author_id: user.id,
        status: "draft",
      })
      .select("slug")
      .single();

    setLoading(false);
    if (error) {
      setError("Сақтау кезінде қате шықты. Қайталап көріңіз.");
      return;
    }
    router.push(`/jazushy`);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <Link href="/jazushy" className="text-sm text-muted hover:text-gold-600">
        ← Жазушы кабинеті
      </Link>
      <h1 className="mt-4 font-display text-3xl">Жаңа кітап</h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="title" className="block text-sm">
            Атауы
          </label>
          <input
            id="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 input"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm">
            Қысқаша сипаттама
          </label>
          <textarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
        <p className="text-xs text-muted">
          Тараулар кітап жасалғаннан кейін қосылады. Жариялау алдында
          мәртебені &ldquo;Жарияланған&rdquo; етіп өзгертіңіз.
        </p>
      </form>
    </div>
  );
}

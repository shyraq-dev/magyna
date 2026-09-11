"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NewThreadForm({
  doramaId,
  doramaSlug,
}: {
  doramaId: string;
  doramaSlug: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [title, setTitle] = useState("");
  const [firstMessage, setFirstMessage] = useState("");
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

    const { data: thread, error: threadError } = await supabase
      .from("dorama_threads")
      .insert({ dorama_id: doramaId, user_id: user.id, title: title.trim() })
      .select("id")
      .single();

    if (threadError || !thread) {
      setLoading(false);
      setError("Тақырып ашылмады. Қайталап көріңіз.");
      return;
    }

    if (firstMessage.trim()) {
      await supabase.from("dorama_thread_replies").insert({
        thread_id: thread.id,
        user_id: user.id,
        content: firstMessage.trim(),
      });
    }

    setLoading(false);
    router.push(`/dorama/${doramaSlug}/taqyryp/${thread.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <div>
        <label htmlFor="title" className="block text-sm">Тақырып атауы</label>
        <input
          id="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 input"
        />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm">
          Бірінші хабарлама (міндетті емес)
        </label>
        <textarea
          id="message"
          rows={5}
          value={firstMessage}
          onChange={(e) => setFirstMessage(e.target.value)}
          className="mt-1 input"
        />
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary px-6 py-3 disabled:opacity-60"
      >
        {loading ? "Ашылуда..." : "Тақырыпты ашу"}
      </button>
    </form>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ThreadReplyForm({ threadId }: { threadId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("dorama_thread_replies").insert({
      thread_id: threadId,
      user_id: user.id,
      content: content.trim(),
    });

    setLoading(false);
    setContent("");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-6 flex gap-3">
      <input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Жауап жазу..."
        className="input flex-1"
      />
      <button
        type="submit"
        disabled={loading}
        className="btn-primary disabled:opacity-60"
      >
        {loading ? "..." : "Жіберу"}
      </button>
    </form>
  );
}

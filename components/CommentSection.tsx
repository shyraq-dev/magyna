"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ReportButton from "@/components/ReportButton";

type Comment = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
};

export default function CommentSection({
  bookId,
  loggedIn,
}: {
  bookId: string;
  loggedIn: boolean;
}) {
  const supabase = createClient();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("comments")
      .select("id, content, created_at, user_id")
      .eq("book_id", bookId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setComments(data ?? []);
        setLoading(false);
      });
  }, [bookId, supabase]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("comments")
      .insert({ book_id: bookId, user_id: user.id, content: text.trim() })
      .select("id, content, created_at, user_id")
      .single();

    if (!error && data) {
      setComments([data, ...comments]);
      setText("");
    }
  }

  return (
    <section>
      <h2 className="font-display text-xl">Пікірлер</h2>

      {loggedIn ? (
        <form onSubmit={submit} className="mt-4 flex gap-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Пікіріңізді жазыңыз..."
            className="input flex-1"
          />
          <button
            type="submit"
            className="btn-primary"
          >
            Жіберу
          </button>
        </form>
      ) : (
        <p className="mt-4 text-sm text-muted">
          Пікір қалдыру үшін жүйеге кіріңіз.
        </p>
      )}

      <ul className="mt-8 space-y-6">
        {!loading && comments.length === 0 && (
          <p className="text-muted">Алғашқы пікірді сіз қалдырыңыз.</p>
        )}
        {comments.map((c) => (
          <li key={c.id} className="border-b border-line pb-6">
            <p>{c.content}</p>
            <div className="mt-2 flex items-center gap-3">
              <p className="text-xs text-muted">
                {new Date(c.created_at).toLocaleDateString("kk-KZ")}
              </p>
              {loggedIn && <ReportButton commentId={c.id} />}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

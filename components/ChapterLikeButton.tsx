"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ChapterLikeButton({
  chapterId,
  initialLiked,
  initialCount,
  loggedIn,
}: {
  chapterId: string;
  initialLiked: boolean;
  initialCount: number;
  loggedIn: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    if (!loggedIn) {
      router.push("/kiru");
      return;
    }
    startTransition(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      if (liked) {
        await supabase
          .from("chapter_likes")
          .delete()
          .eq("user_id", user.id)
          .eq("chapter_id", chapterId);
        setLiked(false);
        setCount((c) => Math.max(0, c - 1));
      } else {
        await supabase.from("chapter_likes").insert({ user_id: user.id, chapter_id: chapterId });
        setLiked(true);
        setCount((c) => c + 1);
      }
    });
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className={
        liked
          ? "flex items-center gap-2 rounded-sm border border-gold-500 px-4 py-2 text-sm text-gold-600 transition hover:bg-gold-300/20"
          : "flex items-center gap-2 rounded-sm border border-line px-4 py-2 text-sm transition hover:border-gold-500"
      }
      aria-pressed={liked}
    >
      <span aria-hidden="true">{liked ? "♥" : "♡"}</span>
      {count > 0 ? count : "Лүпіл басу"}
    </button>
  );
}

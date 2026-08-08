"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function PublishToggle({
  bookId,
  bookTitle,
  bookSlug,
  status,
}: {
  bookId: string;
  bookTitle: string;
  bookSlug: string;
  status: "draft" | "published";
}) {
  const router = useRouter();
  const supabase = createClient();
  const [current, setCurrent] = useState(status);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = current === "published" ? "draft" : "published";
    startTransition(async () => {
      const { error } = await supabase
        .from("books")
        .update({ status: next })
        .eq("id", bookId);
      if (!error) {
        setCurrent(next);
        router.refresh();

        if (next === "published") {
          fetch("/api/push/notify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bookId,
              title: "Жаңа кітап",
              body: bookTitle,
              url: `/kitaptar/${bookSlug}`,
              broadcast: true,
            }),
          }).catch(() => {});
        }
      }
    });
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className={
        current === "published"
          ? "shrink-0 rounded-sm border border-gold-500 px-4 py-2 text-sm text-gold-600 transition hover:bg-gold-300/20"
          : "shrink-0 rounded-sm bg-ink px-4 py-2 text-sm text-paper transition hover:bg-ink-soft"
      }
    >
      {current === "published" ? "Жарияланған · жасыру" : "Жариялау"}
    </button>
  );
}

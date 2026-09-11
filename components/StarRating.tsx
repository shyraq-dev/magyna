"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function Stars({
  value,
  size = "text-base",
}: {
  value: number;
  size?: string;
}) {
  return (
    <span className={size} aria-hidden="true">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= Math.round(value) ? "text-gold-500" : "text-line"}>
          ★
        </span>
      ))}
    </span>
  );
}

export default function StarRating({
  bookId,
  average,
  count,
  initialMyRating,
  loggedIn,
}: {
  bookId: string;
  average: number;
  count: number;
  initialMyRating: number;
  loggedIn: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [myRating, setMyRating] = useState(initialMyRating);
  const [hover, setHover] = useState(0);
  const [isPending, startTransition] = useTransition();

  function rate(value: number) {
    if (!loggedIn) {
      router.push("/kiru");
      return;
    }
    startTransition(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("book_ratings")
        .upsert(
          { user_id: user.id, book_id: bookId, rating: value, updated_at: new Date().toISOString() },
          { onConflict: "user_id,book_id" }
        );

      setMyRating(value);
      router.refresh();
    });
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <Stars value={average} size="text-lg" />
        <span className="text-sm text-muted">
          {average > 0 ? average.toFixed(1) : "—"} ({count} баға)
        </span>
      </div>

      <div className="mt-3 flex items-center gap-1">
        <span className="mr-2 text-sm text-muted">Сіздің бағаңыз:</span>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            disabled={isPending}
            onClick={() => rate(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            aria-label={`${n} жұлдыз`}
            className={
              n <= (hover || myRating) ? "text-xl text-gold-500" : "text-xl text-line"
            }
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );
}

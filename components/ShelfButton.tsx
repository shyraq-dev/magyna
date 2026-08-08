"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ShelfButton({
  bookId,
  initialOnShelf,
  loggedIn,
}: {
  bookId: string;
  initialOnShelf: boolean;
  loggedIn: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [onShelf, setOnShelf] = useState(initialOnShelf);
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

      if (onShelf) {
        await supabase
          .from("shelf")
          .delete()
          .eq("user_id", user.id)
          .eq("book_id", bookId);
      } else {
        await supabase.from("shelf").insert({ user_id: user.id, book_id: bookId });
      }
      setOnShelf(!onShelf);
    });
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className={
        onShelf
          ? "rounded-sm border border-gold-500 px-5 py-2 text-gold-600 transition hover:bg-gold-300/20"
          : "btn-primary"
      }
    >
      {onShelf ? "Сөрeден алу" : "Сөреме қосу"}
    </button>
  );
}

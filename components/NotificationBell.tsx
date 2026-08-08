"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function NotificationBell() {
  const supabase = createClient();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { count: unread } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (!cancelled) setCount(unread ?? 0);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  if (count === null) return null; // logged out, or still loading

  return (
    <Link
      href="/habarlandyrular"
      aria-label={count > 0 ? `${count} оқылмаған хабарландыру` : "Хабарландырулар"}
      className="relative flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white transition hover:border-gold-500"
    >
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M18 16v-5a6 6 0 1 0-12 0v5l-2 3h16l-2-3Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M9.5 21a2.5 2.5 0 0 0 5 0"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-700 px-1 text-[10px] leading-none text-white">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}

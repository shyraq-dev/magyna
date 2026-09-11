"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Notification = {
  id: string;
  type: string;
  message: string;
  url: string | null;
  is_read: boolean;
  created_at: string;
};

const TYPE_ICONS: Record<string, string> = {
  new_chapter: "📖",
  thread_reply: "💬",
  new_comment: "✍️",
};

export default function NotificationList({
  initial,
}: {
  initial: Notification[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [items, setItems] = useState(initial);

  async function markRead(id: string) {
    setItems((cur) => cur.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  }

  async function markAllRead() {
    setItems((cur) => cur.map((n) => ({ ...n, is_read: true })));
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
    router.refresh();
  }

  const hasUnread = items.some((n) => !n.is_read);

  return (
    <div>
      {hasUnread && (
        <button
          onClick={markAllRead}
          className="mb-6 text-sm text-gold-600 underline underline-offset-2"
        >
          Барлығын оқылды деп белгілеу
        </button>
      )}

      <ul className="divide-y divide-line">
        {items.length === 0 && (
          <p className="py-6 text-muted">Әзірге хабарландыру жоқ.</p>
        )}
        {items.map((n) => {
          const content = (
            <div
              className={
                n.is_read
                  ? "flex items-start gap-3 py-4"
                  : "flex items-start gap-3 py-4 font-medium"
              }
            >
              <span aria-hidden="true">{TYPE_ICONS[n.type] ?? "🔔"}</span>
              <div className="flex-1">
                <p>{n.message}</p>
                <p className="mt-1 text-xs font-normal text-muted">
                  {new Date(n.created_at).toLocaleString("kk-KZ")}
                </p>
              </div>
              {!n.is_read && (
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold-500" aria-hidden="true" />
              )}
            </div>
          );

          return (
            <li key={n.id}>
              {n.url ? (
                <Link href={n.url} onClick={() => markRead(n.id)} className="block hover:text-gold-600">
                  {content}
                </Link>
              ) : (
                <button onClick={() => markRead(n.id)} className="block w-full text-left">
                  {content}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

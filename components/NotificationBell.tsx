'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

type Notification = {
  id: string;
  type: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
};

export default function NotificationBell({ userId }: { userId: string }) {
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const supabase = createClient();

  async function load() {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
    setItems(data ?? []);
  }

  useEffect(() => {
    load();

    const channel = supabase
      .channel('notifications-' + userId)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => setItems((prev) => [payload.new as Notification, ...prev])
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const unreadCount = items.filter((i) => !i.is_read).length;

  async function markAllRead() {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
    setItems((prev) => prev.map((i) => ({ ...i, is_read: true })));
  }

  return (
    <div className="relative">
      <button
        onClick={() => {
          setOpen((o) => !o);
          if (!open) markAllRead();
        }}
        aria-label="Хабарландырулар"
        className="focus-ring relative flex h-9 w-9 items-center justify-center rounded-full border border-night-600 hover:border-ember-500"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 8a6 6 0 1112 0c0 5 2 6 2 6H4s2-1 2-6z" />
          <path d="M9 20a3 3 0 006 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-ember-500 text-[10px] font-bold text-night-950">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-72 rounded-lg border border-night-700 bg-night-900 shadow-xl">
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="p-4 text-center text-sm text-parchment-200/50">Хабарландыру жоқ.</p>
            ) : (
              items.map((n) => (
                <Link
                  key={n.id}
                  href={n.link ?? '#'}
                  onClick={() => setOpen(false)}
                  className="focus-ring block border-b border-night-800 px-4 py-3 text-sm text-parchment-200/80 last:border-0 hover:bg-night-800"
                >
                  {n.message}
                  <span className="mt-1 block text-xs text-parchment-200/40">
                    {new Date(n.created_at).toLocaleString('kk-KZ')}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

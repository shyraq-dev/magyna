'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function syncUser(id: string | null) {
      setUserId(id);
      if (!id) {
        setIsAdmin(false);
        return;
      }
      const { data } = await supabase.from('profiles').select('role').eq('id', id).single();
      setIsAdmin(data?.role === 'admin');
    }

    supabase.auth.getUser().then(({ data }) => syncUser(data.user?.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      syncUser(session?.user.id ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  return (
    <header className="sticky top-0 z-40 border-b border-night-700/60 bg-night-950/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="focus-ring group flex items-center gap-2 rounded">
          {/* Шырақ — жалын белгісі */}
          <svg width="22" height="22" viewBox="0 0 24 24" className="shrink-0">
            <path
              d="M12 2c2 3-1 4-1 7a3 3 0 106 0c0-1-.5-2-1-2.5 1.5 1 3 3 3 6a7 7 0 11-14 0c0-4 2.5-6 4-7.5C10 4 11 3 12 2z"
              fill="url(#flame)"
              className="transition-transform group-hover:scale-110"
            />
            <defs>
              <linearGradient id="flame" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e8a33d" />
                <stop offset="100%" stopColor="#b06f16" />
              </linearGradient>
            </defs>
          </svg>
          <span className="font-display text-xl tracking-tight text-parchment-100">Maǵyna</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-parchment-200/80 sm:flex">
          <Link href="/" className="focus-ring rounded hover:text-ember-400">
            Кітапхана
          </Link>
          <Link href="/offline" className="focus-ring rounded hover:text-ember-400">
            Офлайн
          </Link>
          <Link href="/support" className="focus-ring rounded hover:text-ember-400">
            Қолдау
          </Link>
          {isAdmin && (
            <Link href="/write" className="focus-ring rounded hover:text-ember-400">
              Жазу
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {userId ? (
            <>
              <NotificationBell userId={userId} />
              <Link
                href={`/profile/${userId}`}
                className="focus-ring rounded-full border border-night-600 px-3 py-1.5 text-sm hover:border-ember-500"
              >
                Профиль
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="focus-ring rounded-full bg-ember-500 px-4 py-1.5 text-sm font-medium text-night-950 hover:bg-ember-400"
            >
              Кіру
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

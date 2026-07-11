'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { SupportTicket } from '@/types/database';

export default function SupportPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  async function load(uid: string) {
    const { data } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });
    setTickets(data ?? []);
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/login');
        return;
      }
      setUserId(user.id);
      load(user.id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !subject.trim() || !message.trim()) return;
    setLoading(true);
    await supabase.from('support_tickets').insert({ user_id: userId, subject: subject.trim(), message: message.trim() });
    setSubject('');
    setMessage('');
    setSent(true);
    await load(userId);
    setLoading(false);
    setTimeout(() => setSent(false), 2500);
  }

  if (!userId) return null;

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="mb-2 font-display text-3xl text-parchment-100">Қолдау қызметі</h1>
      <p className="mb-8 text-sm text-parchment-200/60">
        Қате тапсаңыз немесе сұрағыңыз болса, осында жазыңыз — жауап осы бетке және хабарландыруларға келеді.
      </p>

      <form onSubmit={submit} className="mb-10 flex flex-col gap-3">
        <input
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Тақырып"
          className="focus-ring rounded-md border border-night-600 bg-night-900 px-3 py-2 text-sm"
        />
        <textarea
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Хабарламаңыз..."
          className="focus-ring rounded-md border border-night-600 bg-night-900 px-3 py-2 text-sm"
        />
        {sent && <p className="text-sm text-steppe-400">Жіберілді!</p>}
        <button
          type="submit"
          disabled={loading}
          className="focus-ring rounded-md bg-ember-500 px-4 py-2 text-sm font-medium text-night-950 hover:bg-ember-400 disabled:opacity-60"
        >
          {loading ? 'Жіберілуде...' : 'Жіберу'}
        </button>
      </form>

      <h2 className="mb-4 font-display text-xl text-parchment-100">Билеттерім</h2>
      <ul className="flex flex-col gap-3">
        {tickets.map((t) => (
          <li key={t.id} className="rounded-lg border border-night-700 bg-night-900 p-4">
            <div className="mb-1 flex items-center justify-between">
              <p className="text-sm font-medium text-parchment-100">{t.subject}</p>
              <span
                className={`text-xs ${
                  t.status === 'answered'
                    ? 'text-steppe-400'
                    : t.status === 'closed'
                      ? 'text-parchment-200/40'
                      : 'text-ember-400'
                }`}
              >
                {t.status === 'answered' ? 'Жауап берілді' : t.status === 'closed' ? 'Жабылған' : 'Ашық'}
              </span>
            </div>
            <p className="text-sm text-parchment-200/70">{t.message}</p>
            {t.admin_reply && (
              <div className="mt-3 rounded-md bg-night-800 p-3 text-sm">
                <p className="mb-1 text-xs text-ember-400">Әкімшінің жауабы:</p>
                <p className="text-parchment-200/80">{t.admin_reply}</p>
              </div>
            )}
          </li>
        ))}
        {tickets.length === 0 && <p className="text-sm text-parchment-200/50">Әлі билет жоқ.</p>}
      </ul>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Ticket = {
  id: string;
  subject: string;
  message: string;
  status: string;
  admin_reply: string | null;
  user: { username: string } | null;
};

export default function AdminTickets({ tickets: initial }: { tickets: Ticket[] }) {
  const [tickets, setTickets] = useState(initial);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const supabase = createClient();

  async function sendReply(id: string) {
    const reply = replyDrafts[id]?.trim();
    if (!reply) return;
    await supabase
      .from('support_tickets')
      .update({ admin_reply: reply, status: 'answered', updated_at: new Date().toISOString() })
      .eq('id', id);
    setTickets((t) => t.map((x) => (x.id === id ? { ...x, admin_reply: reply, status: 'answered' } : x)));
  }

  async function close(id: string) {
    await supabase.from('support_tickets').update({ status: 'closed' }).eq('id', id);
    setTickets((t) => t.map((x) => (x.id === id ? { ...x, status: 'closed' } : x)));
  }

  const open = tickets.filter((t) => t.status !== 'closed');

  return (
    <section>
      <h2 className="mb-4 font-display text-xl text-parchment-100">Қолдау билеттері ({open.length})</h2>
      {open.length === 0 ? (
        <p className="text-sm text-parchment-200/50">Ашық билет жоқ.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {open.map((t) => (
            <li key={t.id} className="rounded-lg border border-night-700 bg-night-900 p-4">
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-parchment-100">{t.subject}</span>
                <span className="text-xs text-parchment-200/40">@{t.user?.username}</span>
              </div>
              <p className="mb-3 text-sm text-parchment-200/70">{t.message}</p>
              {t.admin_reply && (
                <p className="mb-2 rounded bg-night-800 p-2 text-xs text-steppe-400">
                  Жауап: {t.admin_reply}
                </p>
              )}
              <div className="flex gap-2">
                <input
                  value={replyDrafts[t.id] ?? ''}
                  onChange={(e) => setReplyDrafts((d) => ({ ...d, [t.id]: e.target.value }))}
                  placeholder="Жауап жазу..."
                  className="focus-ring w-full rounded-md border border-night-600 bg-night-950 px-2 py-1 text-xs"
                />
                <button
                  onClick={() => sendReply(t.id)}
                  className="focus-ring shrink-0 rounded-full bg-ember-500 px-3 py-1 text-xs font-medium text-night-950"
                >
                  Жіберу
                </button>
                <button
                  onClick={() => close(t.id)}
                  className="focus-ring shrink-0 rounded-full border border-night-600 px-3 py-1 text-xs text-parchment-200/60"
                >
                  Жабу
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Report = {
  id: string;
  content_type: string;
  content_id: string;
  reason: string;
  details: string | null;
  created_at: string;
  reporter: { username: string } | null;
};

const REASON_LABELS: Record<string, string> = {
  plagiarism: 'Плагиат',
  profanity: 'Балағат сөз',
  spam: 'Спам',
  other: 'Басқа',
};

export default function AdminReports({ reports: initial }: { reports: Report[] }) {
  const [reports, setReports] = useState(initial);
  const supabase = createClient();

  async function resolve(id: string, status: 'resolved' | 'dismissed') {
    await supabase.from('reports').update({ status }).eq('id', id);
    setReports((r) => r.filter((x) => x.id !== id));
  }

  return (
    <section>
      <h2 className="mb-4 font-display text-xl text-parchment-100">Шағымдар кезегі ({reports.length})</h2>
      {reports.length === 0 ? (
        <p className="text-sm text-parchment-200/50">Қаралмаған шағым жоқ.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {reports.map((r) => (
            <li key={r.id} className="rounded-lg border border-night-700 bg-night-900 p-4">
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-parchment-100">
                  {r.content_type} · {REASON_LABELS[r.reason] ?? r.reason}
                </span>
                <span className="text-xs text-parchment-200/40">{r.reporter?.username}</span>
              </div>
              {r.details && <p className="mb-3 text-sm text-parchment-200/70">{r.details}</p>}
              <p className="mb-3 text-xs text-parchment-200/40">content_id: {r.content_id}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => resolve(r.id, 'resolved')}
                  className="focus-ring rounded-full border border-steppe-500 px-3 py-1 text-xs text-steppe-400"
                >
                  Шешілді
                </button>
                <button
                  onClick={() => resolve(r.id, 'dismissed')}
                  className="focus-ring rounded-full border border-night-600 px-3 py-1 text-xs text-parchment-200/60"
                >
                  Қабылданбады
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const REASONS: { value: string; label: string }[] = [
  { value: 'plagiarism', label: 'Плагиат' },
  { value: 'profanity', label: 'Балағат сөз' },
  { value: 'spam', label: 'Спам' },
  { value: 'other', label: 'Басқа себеп' },
];

export default function ReportButton({
  contentType,
  contentId,
  userId,
}: {
  contentType: 'book' | 'comment' | 'chapter';
  contentId: string;
  userId: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('spam');
  const [details, setDetails] = useState('');
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  async function submit() {
    if (!userId) return;
    await supabase.from('reports').insert({
      reporter_id: userId,
      content_type: contentType,
      content_id: contentId,
      reason,
      details: details || null,
    });
    setSent(true);
    setTimeout(() => setOpen(false), 1500);
  }

  if (!userId) return null;

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((o) => !o)}
        className="focus-ring text-xs text-parchment-200/40 hover:text-red-400"
      >
        ⚑ Шағымдану
      </button>

      {open && (
        <div className="absolute left-0 top-6 z-40 w-64 rounded-lg border border-night-700 bg-night-900 p-4 shadow-xl">
          {sent ? (
            <p className="text-sm text-steppe-400">Шағым жіберілді, рахмет.</p>
          ) : (
            <>
              <p className="mb-2 text-sm font-medium text-parchment-100">Себебін таңдаңыз</p>
              <div className="mb-3 flex flex-col gap-1">
                {REASONS.map((r) => (
                  <label key={r.value} className="flex items-center gap-2 text-sm text-parchment-200/80">
                    <input
                      type="radio"
                      name="reason"
                      checked={reason === r.value}
                      onChange={() => setReason(r.value)}
                    />
                    {r.label}
                  </label>
                ))}
              </div>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Қосымша түсініктеме (міндетті емес)"
                rows={2}
                className="focus-ring mb-3 w-full rounded-md border border-night-600 bg-night-950 px-2 py-1 text-xs"
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setOpen(false)} className="focus-ring text-xs text-parchment-200/50">
                  Бас тарту
                </button>
                <button
                  onClick={submit}
                  className="focus-ring rounded-full bg-red-500/20 px-3 py-1 text-xs text-red-400 hover:bg-red-500/30"
                >
                  Жіберу
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Prefs = { new_chapter: boolean; comments: boolean; dorama: boolean };

const LABELS: Record<keyof Prefs, string> = {
  new_chapter: "Жаңа тараулар (сөреге сақтаған кітаптар бойынша)",
  comments: "Кітабыма жазылған пікірлер",
  dorama: "Ашқан тақырыптарыма жауаптар",
};

export default function NotificationPreferences({
  userId,
  initial,
}: {
  userId: string;
  initial: Prefs;
}) {
  const supabase = createClient();
  const [prefs, setPrefs] = useState<Prefs>(initial);
  const [saving, setSaving] = useState<keyof Prefs | null>(null);

  async function toggle(key: keyof Prefs) {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    setSaving(key);
    await supabase
      .from("notification_preferences")
      .upsert({ user_id: userId, ...next, updated_at: new Date().toISOString() });
    setSaving(null);
  }

  return (
    <ul className="divide-y divide-line">
      {(Object.keys(LABELS) as (keyof Prefs)[]).map((key) => (
        <li key={key} className="flex items-center justify-between py-3">
          <span className="text-sm">{LABELS[key]}</span>
          <button
            role="switch"
            aria-checked={prefs[key]}
            onClick={() => toggle(key)}
            disabled={saving === key}
            className={
              prefs[key]
                ? "relative h-6 w-11 rounded-full bg-gold-500 transition disabled:opacity-60"
                : "relative h-6 w-11 rounded-full bg-line transition disabled:opacity-60"
            }
          >
            <span
              className={
                prefs[key]
                  ? "absolute left-5 top-0.5 h-5 w-5 rounded-full bg-white transition"
                  : "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition"
              }
            />
          </button>
        </li>
      ))}
      <li className="pt-3 text-xs text-muted">
        «Түн режимі» (Quiet Hours) әлі жоспарда — бұл толықтырулар оны қамтымайды.
      </li>
    </ul>
  );
}

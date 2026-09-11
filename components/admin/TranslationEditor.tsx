"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Translation = { key: string; value: string };

export default function TranslationEditor({
  languageCode,
  initial,
}: {
  languageCode: string;
  initial: Translation[];
}) {
  const supabase = createClient();
  const [rows, setRows] = useState(initial);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [filter, setFilter] = useState("");
  const [error, setError] = useState<string | null>(null);

  const filtered = rows.filter(
    (r) =>
      r.key.toLowerCase().includes(filter.toLowerCase()) ||
      r.value.toLowerCase().includes(filter.toLowerCase())
  );

  async function save(key: string, value: string) {
    const { error } = await supabase
      .from("translations")
      .upsert({ language_code: languageCode, key, value });
    if (error) setError("Сақтау сәтсіз: " + error.message);
  }

  async function updateValue(key: string, newVal: string) {
    setRows((r) =>
      r.map((x) => (x.key === key ? { ...x, value: newVal } : x))
    );
  }

  async function remove(key: string) {
    const ok = window.confirm(`«${key}» кілтін жою керек пе?`);
    if (!ok) return;
    await supabase
      .from("translations")
      .delete()
      .eq("language_code", languageCode)
      .eq("key", key);
    setRows((r) => r.filter((x) => x.key !== key));
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const k = newKey.trim();
    const v = newValue.trim();
    if (!k || !v) return;
    if (rows.find((r) => r.key === k)) {
      setError("Бұл кілт бар. Өңдеу үшін тізімнен табыңыз.");
      return;
    }
    await save(k, v);
    setRows([...rows, { key: k, value: v }]);
    setNewKey("");
    setNewValue("");
  }

  return (
    <div>
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Кілт немесе мән бойынша іздеу..."
        className="input mb-4"
      />

      <ul className="divide-y divide-line">
        {filtered.map((r) => (
          <li key={r.key} className="flex items-center gap-3 py-2">
            <span className="w-40 shrink-0 font-mono text-xs text-muted">{r.key}</span>
            <input
              value={r.value}
              onChange={(e) => updateValue(r.key, e.target.value)}
              onBlur={(e) => save(r.key, e.target.value)}
              className="input flex-1 text-sm"
            />
            <button
              onClick={() => remove(r.key)}
              className="text-xs text-red-700 hover:underline"
            >
              Жою
            </button>
          </li>
        ))}
        {filtered.length === 0 && (
          <p className="py-4 text-muted">Ештеңе табылмады.</p>
        )}
      </ul>

      <form onSubmit={add} className="mt-6 flex flex-wrap gap-3">
        <input
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          placeholder="кілт (мыс. nav.home)"
          className="input w-40"
        />
        <input
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder="аударма мәні"
          className="input flex-1"
        />
        <button type="submit" className="btn-primary text-sm">
          + Қосу
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}

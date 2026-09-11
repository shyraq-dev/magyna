"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Lang = { code: string; name: string; is_active: boolean };

export default function LanguageManager({ initial }: { initial: Lang[] }) {
  const supabase = createClient();
  const [langs, setLangs] = useState(initial);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const c = code.trim().toLowerCase();
    const n = name.trim();
    if (!c || !n) return;

    const { error } = await supabase.from("languages").insert({ code: c, name: n });
    if (error) {
      setError("Қосу сәтсіз аяқталды (код қайталанып тұр ма?).");
      return;
    }
    setLangs([...langs, { code: c, name: n, is_active: true }]);
    setCode("");
    setName("");
  }

  async function rename(target: string, newName: string) {
    setLangs(langs.map((l) => (l.code === target ? { ...l, name: newName } : l)));
    await supabase.from("languages").update({ name: newName }).eq("code", target);
  }

  async function toggle(target: string, isActive: boolean) {
    setLangs(langs.map((l) => (l.code === target ? { ...l, is_active: !isActive } : l)));
    await supabase.from("languages").update({ is_active: !isActive }).eq("code", target);
  }

  async function remove(target: string) {
    if (target === "kk") return; // keep at least the base language
    const ok = window.confirm("Бұл тілді жою керек пе?");
    if (!ok) return;
    setLangs(langs.filter((l) => l.code !== target));
    await supabase.from("languages").delete().eq("code", target);
  }

  return (
    <div>
      <ul className="divide-y divide-line">
        {langs.map((l) => (
          <li key={l.code} className="flex items-center gap-3 py-3">
            <input
              value={l.name}
              onChange={(e) => rename(l.code, e.target.value)}
              className="input flex-1"
            />
            <span className="text-xs text-muted">{l.code}</span>
            <button
              onClick={() => toggle(l.code, l.is_active)}
              className={
                l.is_active
                  ? "rounded-sm border border-gold-500 px-2 py-1 text-xs text-gold-600"
                  : "rounded-sm border border-line px-2 py-1 text-xs text-muted"
              }
            >
              {l.is_active ? "Белсенді" : "Өшірулі"}
            </button>
            {l.code !== "kk" && (
              <button onClick={() => remove(l.code)} className="text-xs text-red-700 hover:underline">
                Жою
              </button>
            )}
          </li>
        ))}
      </ul>

      <form onSubmit={add} className="mt-6 flex gap-3">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="код (мыс. ru)"
          className="input w-24"
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="атауы (мыс. Орысша)"
          className="input flex-1"
        />
        <button type="submit" className="btn-primary text-sm">
          + Тіл қосу
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}

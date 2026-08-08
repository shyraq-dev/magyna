"use client";

import { useState } from "react";

export default function ClearCacheButton() {
  const [status, setStatus] = useState<"idle" | "clearing" | "done">("idle");

  async function clear() {
    setStatus("clearing");

    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }

    // Only our own app-preference keys — never touch Supabase's auth
    // storage keys, which live in localStorage too.
    localStorage.removeItem("magyna:reader-settings");
    localStorage.removeItem("magyna:app-theme");
    Object.keys(localStorage)
      .filter((k) => k.startsWith("magyna:draft:"))
      .forEach((k) => localStorage.removeItem(k));

    setStatus("done");
  }

  return (
    <div>
      <button onClick={clear} disabled={status === "clearing"} className="btn-secondary text-sm disabled:opacity-60">
        {status === "clearing" ? "Тазаланды..." : "Кэшті тазалау"}
      </button>
      {status === "done" && (
        <p className="mt-2 text-sm text-gold-600">Тазаланды. Оқу баптаулары әдепкіге қайтты.</p>
      )}
    </div>
  );
}

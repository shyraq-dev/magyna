"use client";

import { useEffect, useState } from "react";

type CacheInfo = {
  name: string;
  size: number;
  keys: number;
};

type StorageInfo = {
  readerSettings: boolean;
  appTheme: boolean;
  accent: boolean;
  drafts: number;
};

export default function ClearCacheButton() {
  const [caches_, setCaches_] = useState<CacheInfo[]>([]);
  const [storage, setStorage] = useState<StorageInfo | null>(null);
  const [status, setStatus] = useState<"idle" | "clearing" | "done">("idle");

  useEffect(() => {
    async function scan() {
      // Service-worker caches
      if ("caches" in window) {
        const names = await caches.keys();
        const infos: CacheInfo[] = await Promise.all(
          names.map(async (name) => {
            const cache = await caches.open(name);
            const keys = await cache.keys();
            let size = 0;
            for (const req of keys) {
              const resp = await cache.match(req);
              const buf = await resp?.arrayBuffer().catch(() => null);
              if (buf) size += buf.byteLength;
            }
            return { name, size, keys: keys.length };
          })
        );
        setCaches_(infos);
      }

      // localStorage keys
      const draftKeys = Object.keys(localStorage).filter((k) =>
        k.startsWith("magyna:draft:")
      );
      setStorage({
        readerSettings: !!localStorage.getItem("magyna:reader-settings"),
        appTheme: !!localStorage.getItem("magyna:app-theme"),
        accent: !!localStorage.getItem("magyna:accent"),
        drafts: draftKeys.length,
      });
    }
    scan();
  }, []);

  async function clear() {
    setStatus("clearing");

    if ("caches" in window) {
      const names = await caches.keys();
      await Promise.all(names.map((k) => caches.delete(k)));
    }

    localStorage.removeItem("magyna:reader-settings");
    Object.keys(localStorage)
      .filter((k) => k.startsWith("magyna:draft:"))
      .forEach((k) => localStorage.removeItem(k));

    setCaches_([]);
    setStorage((s) =>
      s ? { ...s, readerSettings: false, drafts: 0 } : null
    );
    setStatus("done");
  }

  function fmt(bytes: number) {
    if (bytes < 1024) return `${bytes} Б`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
    return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
  }

  const totalCacheBytes = caches_.reduce((s, c) => s + c.size, 0);
  const hasAnything =
    caches_.length > 0 ||
    storage?.readerSettings ||
    (storage?.drafts ?? 0) > 0;

  if (status === "done") {
    return (
      <p className="rounded-sm border border-gold-500 bg-gold-300/10 px-4 py-3 text-sm text-gold-600">
        Тазаланды. Оқу баптаулары әдепкіге қайтты.
      </p>
    );
  }

  return (
    <div>
      {hasAnything ? (
        <div className="mb-4 space-y-2 rounded-sm border border-line p-4 text-sm">
          {caches_.map((c) => (
            <div key={c.name} className="flex justify-between text-muted">
              <span>Кэш: {c.name}</span>
              <span>
                {c.keys} файл · {fmt(c.size)}
              </span>
            </div>
          ))}
          {caches_.length > 0 && (
            <div className="flex justify-between font-medium">
              <span>Барлық кэш:</span>
              <span>{fmt(totalCacheBytes)}</span>
            </div>
          )}
          {storage?.readerSettings && (
            <div className="flex justify-between text-muted">
              <span>Оқу баптаулары</span>
              <span>қалпына оралады</span>
            </div>
          )}
          {(storage?.drafts ?? 0) > 0 && (
            <div className="flex justify-between text-muted">
              <span>Жоба мәтіндер</span>
              <span>{storage!.drafts} жазба</span>
            </div>
          )}
        </div>
      ) : (
        <p className="mb-4 text-sm text-muted">
          Тазалайтын ештеңе жоқ — кэш бос.
        </p>
      )}

      {hasAnything && (
        <button
          onClick={clear}
          disabled={status === "clearing"}
          className="btn-secondary text-sm disabled:opacity-60"
        >
          {status === "clearing" ? "Тазалануда..." : "Кэшті тазалау"}
        </button>
      )}
    </div>
  );
}

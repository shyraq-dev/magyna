"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BanControls({
  userId,
  isBanned,
}: {
  userId: string;
  isBanned: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function act(duration: string) {
    setLoading(duration);
    await fetch("/api/admin/ban", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, duration }),
    }).catch(() => {});
    setLoading(null);
    router.refresh();
  }

  if (isBanned) {
    return (
      <button
        onClick={() => act("none")}
        disabled={loading !== null}
        className="rounded-sm border border-gold-500 px-3 py-1 text-xs text-gold-600 hover:bg-gold-300/20 disabled:opacity-60"
      >
        {loading ? "..." : "Босату"}
      </button>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => act("3d")}
        disabled={loading !== null}
        className="rounded-sm border border-line px-3 py-1 text-xs hover:border-red-400 hover:text-red-700 disabled:opacity-60"
      >
        {loading === "3d" ? "..." : "3 күн"}
      </button>
      <button
        onClick={() => act("1w")}
        disabled={loading !== null}
        className="rounded-sm border border-line px-3 py-1 text-xs hover:border-red-400 hover:text-red-700 disabled:opacity-60"
      >
        {loading === "1w" ? "..." : "1 апта"}
      </button>
      <button
        onClick={() => act("permanent")}
        disabled={loading !== null}
        className="rounded-sm border border-red-300 px-3 py-1 text-xs text-red-700 hover:bg-red-50 disabled:opacity-60"
      >
        {loading === "permanent" ? "..." : "Мәңгі"}
      </button>
    </div>
  );
}

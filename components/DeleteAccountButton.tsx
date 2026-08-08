"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteAccountButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    const ok = window.confirm(
      "Аккаунтыңызды толығымен өшіру керек пе? Кітаптарыңыз, пікірлеріңіз, сөреңіз және барлық деректеріңіз қайтарымсыз жойылады."
    );
    if (!ok) return;
    const confirmedTwice = window.confirm(
      "Соңғы рет сұраймыз: бұл әрекетті қайтару мүмкін емес. Жалғастыру керек пе?"
    );
    if (!confirmedTwice) return;

    setLoading(true);
    setError(null);

    const res = await fetch("/api/account/delete", { method: "POST" });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error || "Өшіру сәтсіз аяқталды.");
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div>
      <button
        onClick={remove}
        disabled={loading}
        className="rounded-sm border border-red-300 px-4 py-2 text-sm text-red-700 transition hover:bg-red-50 disabled:opacity-60"
      >
        {loading ? "Өшірілуде..." : "⚠️ Аккаунтты өшіру"}
      </button>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}

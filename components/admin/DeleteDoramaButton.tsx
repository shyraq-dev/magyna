"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DeleteDoramaButton({ doramaId }: { doramaId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function remove() {
    const ok = window.confirm(
      "Бұл дорама жазбасын толығымен жою керек пе? Барлық талқылау тақырыптары мен жауаптар да жойылады. Бұл әрекетті қайтару мүмкін емес."
    );
    if (!ok) return;

    setLoading(true);
    const { error } = await supabase.from("doramas").delete().eq("id", doramaId);
    setLoading(false);

    if (!error) {
      router.push("/jazushy/dorama");
      router.refresh();
    } else {
      window.alert("Жою сәтсіз аяқталды. Қайталап көріңіз.");
    }
  }

  return (
    <button
      onClick={remove}
      disabled={loading}
      className="rounded-sm border border-red-300 px-4 py-2 text-sm text-red-700 transition hover:bg-red-50 disabled:opacity-60"
    >
      {loading ? "Жойылуда..." : "Дораманы жою"}
    </button>
  );
}

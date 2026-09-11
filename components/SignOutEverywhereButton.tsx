"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignOutEverywhereButton() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function signOutAll() {
    const ok = window.confirm(
      "Барлық құрылғыдан шығу керек пе? Барлық жерде қайта кіру қажет болады."
    );
    if (!ok) return;

    setLoading(true);
    await supabase.auth.signOut({ scope: "global" });
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={signOutAll}
      disabled={loading}
      className="rounded-sm border border-red-300 px-4 py-2 text-sm text-red-700 transition hover:bg-red-50 disabled:opacity-60"
    >
      {loading ? "Шығуда..." : "Барлық құрылғыдан шығу"}
    </button>
  );
}

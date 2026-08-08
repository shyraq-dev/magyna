"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ReportActions({
  reportId,
  commentId,
}: {
  reportId: string;
  commentId: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState<string | null>(null);

  async function deleteComment() {
    setLoading("delete");
    await supabase.from("comments").delete().eq("id", commentId);
    await supabase.from("reports").update({ status: "resolved" }).eq("id", reportId);
    setLoading(null);
    router.refresh();
  }

  async function dismiss() {
    setLoading("dismiss");
    await supabase.from("reports").update({ status: "dismissed" }).eq("id", reportId);
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={deleteComment}
        disabled={loading !== null}
        className="rounded-sm border border-red-300 px-3 py-1.5 text-xs text-red-700 hover:bg-red-50 disabled:opacity-60"
      >
        {loading === "delete" ? "..." : "Пікірді өшіру"}
      </button>
      <button
        onClick={dismiss}
        disabled={loading !== null}
        className="rounded-sm border border-line px-3 py-1.5 text-xs text-muted hover:border-gold-500 disabled:opacity-60"
      >
        {loading === "dismiss" ? "..." : "Елемеу"}
      </button>
    </div>
  );
}

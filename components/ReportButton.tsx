"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const REASONS = [
  { value: "plagiarism", label: "Плагиат" },
  { value: "profanity", label: "Балағат сөз" },
  { value: "spam", label: "Спам" },
  { value: "other", label: "Басқа себеп" },
];

export default function ReportButton({ commentId }: { commentId: string }) {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0].value);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit() {
    setStatus("sending");
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setStatus("error");
      return;
    }

    const { error } = await supabase.from("reports").insert({
      target_type: "comment",
      target_id: commentId,
      reporter_id: user.id,
      reason,
    });

    setStatus(error ? "error" : "sent");
  }

  if (status === "sent") {
    return <span className="text-xs text-muted">Шағым жіберілді</span>;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-muted hover:text-red-700"
      >
        Шағымдану
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <select
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="rounded-sm border border-line bg-white px-2 py-1"
      >
        {REASONS.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={submit}
        disabled={status === "sending"}
        className="rounded-sm border border-red-300 px-2 py-1 text-red-700 hover:bg-red-50 disabled:opacity-60"
      >
        {status === "sending" ? "Жіберілуде..." : "Жіберу"}
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-muted underline">
        Бас тарту
      </button>
      {status === "error" && <span className="text-red-700">Қате шықты.</span>}
    </div>
  );
}

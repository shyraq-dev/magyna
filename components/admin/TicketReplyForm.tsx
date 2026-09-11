"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function TicketReplyForm({
  ticketId,
  existingReply,
  onResolved,
}: {
  ticketId: string;
  existingReply: string | null;
  onResolved: () => void;
}) {
  const supabase = createClient();
  const [reply, setReply] = useState(existingReply ?? "");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim()) return;
    setSaving(true);

    await supabase
      .from("support_tickets")
      .update({ admin_reply: reply.trim(), status: "resolved" })
      .eq("id", ticketId);

    setSaving(false);
    setDone(true);
    onResolved();
  }

  if (done) {
    return <p className="text-sm text-gold-600">Жауап жіберілді, тікет жабылды.</p>;
  }

  return (
    <form onSubmit={send} className="mt-3 space-y-2">
      <textarea
        rows={3}
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        placeholder="Жауапты жазыңыз..."
        className="input text-sm"
        required
      />
      <button type="submit" disabled={saving} className="btn-primary text-sm disabled:opacity-60">
        {saving ? "Жіберілуде..." : "Жауап беру & Жабу"}
      </button>
    </form>
  );
}

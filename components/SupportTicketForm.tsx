"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SupportTicketForm() {
  const supabase = createClient();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setStatus("error");
      return;
    }

    const { error } = await supabase.from("support_tickets").insert({
      user_id: user.id,
      subject: subject.trim(),
      message: message.trim(),
    });

    if (error) {
      setStatus("error");
      return;
    }
    setStatus("sent");
    setSubject("");
    setMessage("");
  }

  if (status === "sent") {
    return (
      <p className="rounded-sm border border-gold-500 bg-gold-300/10 px-4 py-3 text-sm text-gold-600">
        Хатыңыз жіберілді. Жауапты жақын арада аламыз.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="ticket-subject" className="block text-sm">Тақырып</label>
        <input
          id="ticket-subject"
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="mt-1 input"
        />
      </div>
      <div>
        <label htmlFor="ticket-message" className="block text-sm">Хабарлама</label>
        <textarea
          id="ticket-message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-1 input"
        />
      </div>
      {status === "error" && (
        <p className="text-sm text-red-700">Жіберу сәтсіз аяқталды. Қайталап көріңіз.</p>
      )}
      <button type="submit" disabled={status === "sending"} className="btn-primary text-sm disabled:opacity-60">
        {status === "sending" ? "Жіберілуде..." : "Жіберу"}
      </button>
    </form>
  );
}

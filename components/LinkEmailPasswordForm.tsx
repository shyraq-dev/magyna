import { toKazakhError } from "@/lib/errors";
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LinkEmailPasswordForm() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError(null);

    const { error } = await supabase.auth.updateUser({ email, password });

    if (error) {
      setStatus("error");
      setError(toKazakhError(error.message));
      return;
    }
    setStatus("done");
  }

  if (status === "done") {
    return (
      <p className="rounded-sm border border-gold-500 bg-gold-300/10 px-4 py-3 text-sm text-gold-600">
        Растау сілтемесі {email}-ге жіберілді. Оны бассаңыз, бұл
        тіркелгіге email + құпия сөзбен кез келген құрылғыдан кіре
        аласыз (Telegram-нан бөлек).
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <p className="text-sm text-muted">
        Қазір тек Telegram арқылы кіресіз. Бұл жерде email мен құпия сөз
        қойып, сол тіркелгіге кез келген құрылғыдан (Telegram-сыз да)
        кіру мүмкіндігін қоса аласыз.
      </p>
      <div>
        <label htmlFor="link-email" className="block text-sm">Email</label>
        <input
          id="link-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 input"
        />
      </div>
      <div>
        <label htmlFor="link-password" className="block text-sm">Құпия сөз</label>
        <input
          id="link-password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 input"
        />
      </div>
      {status === "error" && <p className="text-sm text-red-700">{error}</p>}
      <button type="submit" disabled={status === "saving"} className="btn-secondary text-sm disabled:opacity-60">
        {status === "saving" ? "Жіберілуде..." : "Email + құпия сөз қосу"}
      </button>
    </form>
  );
}

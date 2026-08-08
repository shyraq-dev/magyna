"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function PasswordChangeForm() {
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError(null);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setStatus("error");
      setError(error.message);
      return;
    }
    setStatus("done");
    setPassword("");
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <label htmlFor="new-password" className="block text-sm">
        Жаңа құпия сөз
      </label>
      <input
        id="new-password"
        type="password"
        required
        minLength={6}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="input"
      />
      {status === "error" && <p className="text-sm text-red-700">{error}</p>}
      {status === "done" && <p className="text-sm text-gold-600">Құпия сөз жаңартылды.</p>}
      <button type="submit" disabled={status === "saving"} className="btn-secondary text-sm disabled:opacity-60">
        {status === "saving" ? "Сақталуда..." : "Құпия сөзді жаңарту"}
      </button>
    </form>
  );
}

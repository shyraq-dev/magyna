"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function TirkeluPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);
    if (error) {
      setError(
        error.message.includes("already registered")
          ? "Бұл email тіркелген. Жүйеге кіріп көріңіз."
          : "Тіркелу сәтсіз аяқталды. Қайталап көріңіз."
      );
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="mx-auto max-w-sm px-6 py-20 text-center">
        <h1 className="font-display text-2xl">Email-ді тексеріңіз</h1>
        <p className="mt-3 text-muted">
          Тіркелгіні растау үшін {email} мекенжайына жіберілген сілтемені
          басыңыз.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-20">
      <h1 className="font-display text-3xl">Тіркелу</h1>
      <p className="mt-2 text-sm text-muted">
        Тіркелгіңіз бар ма?{" "}
        <Link href="/kiru" className="text-gold-600 underline">
          Кіру
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="username" className="block text-sm">
            Пайдаланушы аты
          </label>
          <input
            id="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 input"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 input"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm">
            Құпия сөз
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 input"
          />
        </div>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3 disabled:opacity-60"
        >
          {loading ? "Жіберілуде..." : "Тіркелу"}
        </button>

        <p className="text-xs text-muted">
          Тіркелу арқылы сіз{" "}
          <Link href="/baptaular/erezheler" className="underline">
            Пайдалану шартымен
          </Link>{" "}
          және{" "}
          <Link href="/baptaular/kupiyalyk" className="underline">
            Құпиялық саясатымен
          </Link>{" "}
          келісесіз.
        </p>
      </form>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/reset-password`,
    });
    setLoading(false);
    setSent(true);
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-16">
      <div>
        <h1 className="font-display text-3xl text-parchment-100">Құпиясөзді ұмыттыңыз ба?</h1>
        <p className="mt-1 text-sm text-parchment-200/60">
          Email-ыңызды енгізіңіз, сізге парольді қалпына келтіру сілтемесін жібереміз.
        </p>
      </div>

      {sent ? (
        <p className="text-sm text-steppe-400">
          Сілтеме жіберілді! Поштаңызды тексеріп, сілтеме арқылы жаңа пароль орнатыңыз.
        </p>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="focus-ring rounded-md border border-night-600 bg-night-900 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="focus-ring rounded-md bg-ember-500 px-4 py-2 text-sm font-medium text-night-950 hover:bg-ember-400 disabled:opacity-60"
          >
            {loading ? 'Жіберілуде...' : 'Сілтеме жіберу'}
          </button>
        </form>
      )}

      <Link href="/login" className="focus-ring text-sm text-ember-400 hover:underline">
        Кіру бетіне оралу
      </Link>
    </div>
  );
}

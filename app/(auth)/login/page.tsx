'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError('Email немесе құпиясөз қате.');
      return;
    }
    router.push('/');
    router.refresh();
  }

  async function handleOAuth(provider: 'google') {
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-16">
      <div>
        <h1 className="font-display text-3xl text-parchment-100">Қош келдіңіз</h1>
        <p className="mt-1 text-sm text-parchment-200/60">Оқуды жалғастыру үшін кіріңіз.</p>
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-3">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="focus-ring rounded-md border border-night-600 bg-night-900 px-3 py-2 text-sm"
        />
        <input
          type="password"
          required
          placeholder="Құпиясөз"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="focus-ring rounded-md border border-night-600 bg-night-900 px-3 py-2 text-sm"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Link href="/forgot-password" className="focus-ring text-right text-xs text-ember-400 hover:underline">
          Құпиясөзді ұмыттыңыз ба?
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="focus-ring rounded-md bg-ember-500 px-4 py-2 text-sm font-medium text-night-950 hover:bg-ember-400 disabled:opacity-60"
        >
          {loading ? 'Кіру...' : 'Кіру'}
        </button>
      </form>

      <div className="flex items-center gap-3 text-xs text-parchment-200/40">
        <div className="h-px flex-1 bg-night-700" />
        немесе
        <div className="h-px flex-1 bg-night-700" />
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={() => handleOAuth('google')}
          className="focus-ring rounded-md border border-night-600 px-4 py-2 text-sm hover:border-ember-500"
        >
          Google арқылы кіру
        </button>
      </div>

      <p className="text-sm text-parchment-200/60">
        Аккаунтыңыз жоқ па?{' '}
        <Link href="/register" className="text-ember-400 hover:underline">
          Тіркелу
        </Link>
      </p>
    </div>
  );
}

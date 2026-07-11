'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { validatePassword } from '@/lib/validation';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    setLoading(true);
    setError(null);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError('Қате шықты. Сілтеме ескірген болуы мүмкін — қайта сұраныс жіберіңіз.');
      return;
    }
    setDone(true);
    setTimeout(() => router.push('/'), 1500);
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-16">
      <div>
        <h1 className="font-display text-3xl text-parchment-100">Жаңа пароль орнату</h1>
      </div>

      {done ? (
        <p className="text-sm text-steppe-400">Пароль жаңартылды! Бас бетке бағыттаудамыз...</p>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            type="password"
            required
            minLength={8}
            placeholder="Жаңа пароль (кемінде 8 таңба, 1 бас әріп, 1 сан)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="focus-ring rounded-md border border-night-600 bg-night-900 px-3 py-2 text-sm"
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="focus-ring rounded-md bg-ember-500 px-4 py-2 text-sm font-medium text-night-950 hover:bg-ember-400 disabled:opacity-60"
          >
            {loading ? 'Сақталуда...' : 'Парольді сақтау'}
          </button>
        </form>
      )}
    </div>
  );
}

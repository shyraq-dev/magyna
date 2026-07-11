'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { validatePassword } from '@/lib/validation';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confirmMessage, setConfirmMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const passwordError = validatePassword(password);
    if (passwordError) {
      setLoading(false);
      setError(passwordError);
      return;
    }

    // Никнейм profiles кестесіне database trigger арқылы автоматты жазылады
    // (auth.users-ке жазба құрылған сәтте) — email растауы қосулы болса да
    // жұмыс істейді, себебі клиент сессиясына тәуелді емес.
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });

    setLoading(false);

    if (signUpError) {
      setError(
        signUpError.message.includes('already registered')
          ? 'Бұл email-мен аккаунт бұрын тіркелген.'
          : 'Тіркелу мүмкін болмады. Қайталап көріңіз.'
      );
      return;
    }

    if (!data.session) {
      // Email растауы қосулы — сессия әлі жоқ
      setConfirmMessage(
        'Тіркелу сәтті өтті! Аккаунтты растау үшін email-ыңызға жіберілген сілтемені басыңыз, содан кейін жүйеге кіріңіз.'
      );
      return;
    }

    router.push('/');
    router.refresh();
  }

  if (confirmMessage) {
    return (
      <div className="mx-auto flex max-w-sm flex-col gap-4 px-4 py-16 text-center">
        <h1 className="font-display text-2xl text-parchment-100">Email-ды тексеріңіз</h1>
        <p className="text-sm text-parchment-200/70">{confirmMessage}</p>
        <Link href="/login" className="focus-ring mt-2 text-ember-400 hover:underline">
          Кіру бетіне өту
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-16">
      <div>
        <h1 className="font-display text-3xl text-parchment-100">Тіркелу</h1>
        <p className="mt-1 text-sm text-parchment-200/60">Оқырман ретінде қосылыңыз.</p>
      </div>

      <form onSubmit={handleRegister} className="flex flex-col gap-3">
        <input
          required
          placeholder="Никнейм"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="focus-ring rounded-md border border-night-600 bg-night-900 px-3 py-2 text-sm"
        />
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
          minLength={8}
          placeholder="Құпиясөз (кемінде 8 таңба, 1 бас әріп, 1 сан)"
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
          {loading ? 'Тіркелуде...' : 'Тіркелу'}
        </button>
      </form>

      <p className="text-sm text-parchment-200/60">
        Аккаунтыңыз бар ма?{' '}
        <Link href="/login" className="text-ember-400 hover:underline">
          Кіру
        </Link>
      </p>
    </div>
  );
}

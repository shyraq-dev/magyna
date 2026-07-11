'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LogoutButton() {
  const supabase = createClient();
  const router = useRouter();

  async function logout() {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      className="focus-ring rounded-full border border-night-600 px-4 py-1.5 text-sm hover:border-ember-500"
    >
      Шығу
    </button>
  );
}

'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type User = {
  id: string;
  username: string;
  display_name: string | null;
  role: string;
  is_banned: boolean;
  banned_until: string | null;
};

const BAN_DURATIONS = [
  { label: '3 күн', days: 3 },
  { label: '7 күн', days: 7 },
  { label: 'Мәңгі', days: null },
];

export default function AdminUsers({ users: initial }: { users: User[] }) {
  const [users, setUsers] = useState(initial);
  const [search, setSearch] = useState('');
  const supabase = createClient();

  async function ban(id: string, days: number | null) {
    const banned_until = days ? new Date(Date.now() + days * 24 * 3600 * 1000).toISOString() : null;
    await supabase.from('profiles').update({ is_banned: true, banned_until }).eq('id', id);
    setUsers((u) => u.map((x) => (x.id === id ? { ...x, is_banned: true, banned_until } : x)));
  }

  async function unban(id: string) {
    await supabase.from('profiles').update({ is_banned: false, banned_until: null }).eq('id', id);
    setUsers((u) => u.map((x) => (x.id === id ? { ...x, is_banned: false, banned_until: null } : x)));
  }

  async function setRole(id: string, role: string) {
    await supabase.from('profiles').update({ role }).eq('id', id);
    setUsers((u) => u.map((x) => (x.id === id ? { ...x, role } : x)));
  }

  const filtered = users.filter(
    (u) =>
      !search ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.display_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl text-parchment-100">Пайдаланушылар</h2>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Никнейм бойынша іздеу..."
          className="focus-ring rounded-md border border-night-600 bg-night-900 px-3 py-1.5 text-xs"
        />
      </div>
      <div className="overflow-hidden rounded-lg border border-night-700">
        <table className="w-full text-sm">
          <thead className="bg-night-900 text-left text-xs text-parchment-200/50">
            <tr>
              <th className="px-4 py-2">Никнейм</th>
              <th className="px-4 py-2">Рөл</th>
              <th className="px-4 py-2">Күй</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-t border-night-800">
                <td className="px-4 py-2 text-parchment-100">{u.display_name ?? u.username}</td>
                <td className="px-4 py-2">
                  <select
                    value={u.role}
                    onChange={(e) => setRole(u.id, e.target.value)}
                    className="focus-ring rounded border border-night-600 bg-night-900 px-2 py-1 text-xs"
                  >
                    <option value="reader">reader</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="px-4 py-2">
                  {u.is_banned ? (
                    <span className="text-red-400">
                      Бұғатталған{u.banned_until ? ` (${new Date(u.banned_until).toLocaleDateString('kk-KZ')} дейін)` : ' (мәңгі)'}
                    </span>
                  ) : (
                    <span className="text-steppe-400">Белсенді</span>
                  )}
                </td>
                <td className="px-4 py-2 text-right">
                  {u.is_banned ? (
                    <button
                      onClick={() => unban(u.id)}
                      className="focus-ring rounded-full border border-night-600 px-3 py-1 text-xs hover:border-ember-500"
                    >
                      Босату
                    </button>
                  ) : (
                    <div className="flex justify-end gap-1">
                      {BAN_DURATIONS.map((d) => (
                        <button
                          key={d.label}
                          onClick={() => ban(u.id, d.days)}
                          className="focus-ring rounded-full border border-night-600 px-2 py-1 text-xs hover:border-red-400"
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

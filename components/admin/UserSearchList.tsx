"use client";

import { useMemo, useState } from "react";
import BanControls from "@/components/admin/BanControls";

type Row = {
  id: string;
  username: string;
  full_name: string | null;
  email: string | null;
  createdAt: string;
  isBanned: boolean;
  isAdmin: boolean;
};

export default function UserSearchList({ users }: { users: Row[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        (u.email ?? "").toLowerCase().includes(q) ||
        (u.full_name ?? "").toLowerCase().includes(q)
    );
  }, [users, query]);

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Никнейм немесе email бойынша іздеу..."
        className="input"
      />

      <ul className="mt-6 divide-y divide-line">
        {filtered.length === 0 && (
          <p className="py-4 text-muted">Ешкім табылмады.</p>
        )}
        {filtered.map((u) => (
          <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div>
              <p className="font-display">
                @{u.username}
                {u.isAdmin && (
                  <span className="ml-2 text-xs text-gold-600">Бас автор</span>
                )}
                {u.isBanned && (
                  <span className="ml-2 text-xs text-red-700">Бұғатталған</span>
                )}
              </p>
              <p className="text-xs text-muted">
                {u.email || "—"} · {new Date(u.createdAt).toLocaleDateString("kk-KZ")}
              </p>
            </div>
            {!u.isAdmin && <BanControls userId={u.id} isBanned={u.isBanned} />}
          </li>
        ))}
      </ul>
    </div>
  );
}

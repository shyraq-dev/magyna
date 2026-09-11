"use client";

import { useMemo, useState } from "react";
import BanControls from "@/components/admin/BanControls";

type Row = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  email: string | null;
  createdAt: string;
  isBanned: boolean;
  isAdmin: boolean;
};

function ProfileDrawer({ user, onClose }: { user: Row; onClose: () => void }) {
  const initial = (user.username || "?").charAt(0).toUpperCase();

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-t-xl bg-paper p-6 sm:rounded-xl"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-nib-gradient font-display text-2xl text-ink">
            {user.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              initial
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display text-xl">
              {user.full_name || `@${user.username}`}
            </p>
            <p className="text-sm text-muted">@{user.username}</p>
            {user.email && <p className="text-sm text-muted">{user.email}</p>}
          </div>
          <button onClick={onClose} className="text-xl text-muted">×</button>
        </div>

        {user.bio && (
          <p className="mt-4 text-sm leading-relaxed">{user.bio}</p>
        )}

        <dl className="mt-4 divide-y divide-line text-sm">
          <div className="flex justify-between py-2">
            <dt className="text-muted">Тіркелген</dt>
            <dd>{new Date(user.createdAt).toLocaleDateString("kk-KZ")}</dd>
          </div>
          <div className="flex justify-between py-2">
            <dt className="text-muted">Күй</dt>
            <dd>
              {user.isAdmin ? (
                <span className="text-gold-600">Бас автор</span>
              ) : user.isBanned ? (
                <span className="text-red-700">Бұғатталған</span>
              ) : (
                "Белсенді"
              )}
            </dd>
          </div>
        </dl>

        {!user.isAdmin && (
          <div className="mt-4 border-t border-line pt-4">
            <BanControls userId={user.id} isBanned={user.isBanned} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function UserSearchList({ users }: { users: Row[] }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Row | null>(null);

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
        placeholder="Қолданушы аты немесе email бойынша іздеу..."
        className="input"
      />

      <ul className="mt-6 divide-y divide-line">
        {filtered.length === 0 && (
          <p className="py-4 text-muted">Ешкім табылмады.</p>
        )}
        {filtered.map((u) => (
          <li key={u.id}>
            <button
              type="button"
              onClick={() => setSelected(u)}
              className="flex w-full items-center gap-3 py-4 text-left transition hover:text-gold-600"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-nib-gradient font-display text-sm text-ink">
                {u.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={u.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  (u.username || "?").charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">
                  {u.full_name || `@${u.username}`}
                  {u.isAdmin && (
                    <span className="ml-2 text-xs text-gold-600">Бас автор</span>
                  )}
                  {u.isBanned && (
                    <span className="ml-2 text-xs text-red-700">Бұғатталған</span>
                  )}
                </p>
                <p className="truncate text-xs text-muted">
                  @{u.username}
                  {u.email ? ` · ${u.email}` : ""}
                </p>
              </div>
            </button>
          </li>
        ))}
      </ul>

      {selected && (
        <ProfileDrawer user={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

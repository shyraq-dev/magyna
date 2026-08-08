import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import UserSearchList from "@/components/admin/UserSearchList";

export default async function AdminUsersPage() {
  const supabase = createClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, full_name, is_admin, created_at")
    .order("created_at", { ascending: false });

  // Email and ban status live on auth.users, not profiles — only the
  // service-role client can read that, so this page must stay server-only.
  const admin = createAdminClient();
  const { data: authList } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  const authById = new Map((authList?.users ?? []).map((u: any) => [u.id, u]));

  const rows = (profiles ?? []).map((p: any) => {
    const authUser = authById.get(p.id);
    const bannedUntil = authUser?.banned_until;
    const isBanned = !!bannedUntil && new Date(bannedUntil) > new Date();
    return {
      id: p.id,
      username: p.username,
      full_name: p.full_name,
      email: authUser?.email?.endsWith("@telegram.magyna.local")
        ? null
        : authUser?.email ?? null,
      createdAt: p.created_at,
      isBanned,
      isAdmin: p.is_admin,
    };
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/avtor" className="text-sm text-muted hover:text-gold-600">
        ← Автор кабинеті
      </Link>
      <h1 className="mt-4 font-display text-3xl">Пайдаланушылар</h1>
      <p className="mt-2 text-muted">Барлығы: {rows.length}</p>

      <div className="mt-8">
        <UserSearchList users={rows} />
      </div>
    </div>
  );
}

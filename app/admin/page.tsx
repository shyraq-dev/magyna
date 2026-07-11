import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminUsers from '@/components/admin/AdminUsers';
import AdminBooks from '@/components/admin/AdminBooks';
import AdminGenres from '@/components/admin/AdminGenres';
import AdminReports from '@/components/admin/AdminReports';
import AdminTickets from '@/components/admin/AdminTickets';

export const revalidate = 0;

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/');

  const [{ data: users }, { data: books }, { data: genres }, { data: reports }, { data: tickets }] =
    await Promise.all([
      supabase
        .from('profiles')
        .select('id, username, display_name, role, is_banned, banned_until, created_at')
        .order('created_at', { ascending: false }),
      supabase
        .from('books')
        .select('id, title, status, is_featured, author:profiles(username)')
        .order('created_at', { ascending: false }),
      supabase.from('genres').select('id, name, slug').order('name'),
      supabase
        .from('reports')
        .select('*, reporter:profiles(username)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false }),
      supabase.from('support_tickets').select('*, user:profiles(username)').order('created_at', { ascending: false }),
    ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-8 font-display text-3xl text-parchment-100">Әкімшілік панель</h1>

      <div className="flex flex-col gap-12">
        <AdminReports reports={(reports as any) ?? []} />
        <AdminTickets tickets={(tickets as any) ?? []} />
        <AdminUsers users={users ?? []} />
        <AdminBooks books={(books as any) ?? []} />
        <AdminGenres genres={genres ?? []} />
      </div>
    </div>
  );
}

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = createClient();

  const { count: pendingReports } = await supabase
    .from("reports")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  const { count: openTickets } = await supabase
    .from("support_tickets")
    .select("id", { count: "exact", head: true })
    .eq("status", "open");

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-3xl">Автор кабинеті</h1>
      <p className="mt-2 text-muted">Пайдаланушылар мен модерация</p>

      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/avtor/paydalanushylar"
          className="rounded-sm border border-line px-5 py-3 text-sm transition hover:border-gold-500"
        >
          Пайдаланушылар
        </Link>
        <Link
          href="/avtor/shagymdar"
          className="rounded-sm border border-line px-5 py-3 text-sm transition hover:border-gold-500"
        >
          Шағымдар
          {!!pendingReports && (
            <span className="ml-2 rounded-sm bg-red-700 px-1.5 py-0.5 text-xs text-white">
              {pendingReports}
            </span>
          )}
        </Link>
        <Link
          href="/avtor/qoldau"
          className="rounded-sm border border-line px-5 py-3 text-sm transition hover:border-gold-500"
        >
          Қолдау хаттары
          {!!openTickets && (
            <span className="ml-2 rounded-sm bg-red-700 px-1.5 py-0.5 text-xs text-white">
              {openTickets}
            </span>
          )}
        </Link>
      </div>
    </div>
  );
}

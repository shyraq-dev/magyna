import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminSupportPage() {
  const supabase = createClient();

  const { data: tickets } = await supabase
    .from("support_tickets")
    .select("id, subject, message, status, created_at, user_id, profiles(username)")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/avtor" className="text-sm text-muted hover:text-gold-600">
        ← Автор кабинеті
      </Link>
      <h1 className="mt-4 font-display text-3xl">Қолдау хаттары</h1>

      <ul className="mt-8 divide-y divide-line">
        {tickets?.length ? (
          tickets.map((t: any) => (
            <li key={t.id} className="py-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">{t.subject}</p>
                <span
                  className={
                    t.status === "open"
                      ? "rounded-sm border border-gold-500 bg-gold-300/10 px-2 py-0.5 text-xs text-gold-600"
                      : "rounded-sm border border-line px-2 py-0.5 text-xs text-muted"
                  }
                >
                  {t.status === "open" ? "Жаңа" : "Шешілді"}
                </span>
              </div>
              <p className="mt-2 text-sm">{t.message}</p>
              <p className="mt-2 text-xs text-muted">
                @{t.profiles?.username ?? "белгісіз"} ·{" "}
                {new Date(t.created_at).toLocaleString("kk-KZ")}
              </p>
            </li>
          ))
        ) : (
          <p className="py-6 text-muted">Хат жоқ.</p>
        )}
      </ul>
    </div>
  );
}

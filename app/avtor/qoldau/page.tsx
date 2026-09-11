import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import TicketReplyForm from "@/components/admin/TicketReplyForm";

export default async function AdminSupportPage() {
  const supabase = createClient();

  const { data: tickets } = await supabase
    .from("support_tickets")
    .select("id, subject, message, admin_reply, status, created_at, user_id, profiles(username, full_name, avatar_url)")
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
            <li key={t.id} className="py-5">
              <div className="flex items-start gap-3">
                {t.profiles?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={t.profiles.avatar_url}
                    alt=""
                    className="h-9 w-9 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-nib-gradient font-display text-sm text-ink">
                    {(t.profiles?.username || "?").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href={`/beyin?user=${t.user_id}`}
                      className="text-sm font-medium hover:text-gold-600"
                    >
                      {t.profiles?.full_name || t.profiles?.username || "белгісіз"}
                    </Link>
                    <span
                      className={
                        t.status === "open"
                          ? "rounded-sm border border-gold-500 bg-gold-300/10 px-2 py-0.5 text-xs text-gold-600"
                          : "rounded-sm border border-line px-2 py-0.5 text-xs text-muted"
                      }
                    >
                      {t.status === "open" ? "Жаңа" : "Жабылған"}
                    </span>
                  </div>
                  <p className="mt-0.5 font-medium">{t.subject}</p>
                  <p className="mt-1 text-sm text-muted">{t.message}</p>
                  <p className="mt-1 text-xs text-muted">
                    {new Date(t.created_at).toLocaleString("kk-KZ")}
                  </p>

                  {t.admin_reply && (
                    <div className="mt-3 rounded-sm border border-line bg-paper-dim p-3">
                      <p className="text-xs text-muted">Жауап:</p>
                      <p className="mt-1 text-sm">{t.admin_reply}</p>
                    </div>
                  )}

                  {t.status === "open" && (
                    <TicketReplyForm
                      ticketId={t.id}
                      existingReply={t.admin_reply}
                      onResolved={() => {}}
                    />
                  )}
                </div>
              </div>
            </li>
          ))
        ) : (
          <p className="py-6 text-muted">Хат жоқ.</p>
        )}
      </ul>
    </div>
  );
}

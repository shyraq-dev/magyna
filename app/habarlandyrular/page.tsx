import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import NotificationList from "@/components/NotificationList";

export default async function NotificationsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/kiru");

  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, type, message, url, is_read, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/beyin" className="text-sm text-muted hover:text-gold-600">
        ← Бейін
      </Link>
      <h1 className="mt-4 font-display text-3xl">Хабарландырулар</h1>

      <div className="mt-8">
        <NotificationList initial={notifications ?? []} />
      </div>
    </div>
  );
}

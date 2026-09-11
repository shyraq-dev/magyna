import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import NotificationPreferences from "@/components/NotificationPreferences";
import PushSubscribeButton from "@/components/PushSubscribeButton";

export default async function NotificationSettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/kiru");

  const { data: prefs } = await supabase
    .from("notification_preferences")
    .select("new_chapter, comments, dorama")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <Link href="/baptaular" className="text-sm text-muted hover:text-gold-600">
        ← Баптау
      </Link>
      <h1 className="mt-4 font-display text-3xl">Мәлімдеме</h1>

      <div className="mt-8">
        <NotificationPreferences
          userId={user.id}
          initial={{
            new_chapter: prefs?.new_chapter ?? true,
            comments: prefs?.comments ?? true,
            dorama: prefs?.dorama ?? true,
          }}
        />
      </div>

      <div className="nib-divider" />

      <section>
        <h2 className="font-display text-lg">Push-хабарламалар</h2>
        <p className="mt-2 text-sm text-muted">
          Браузерден тыс хабарлама алу. Тек браузердегі нұсқада жұмыс
          істейді — Telegram Mini App ішінде сервис воркер жұмыс
          жасамайды, сондықтан ол жерде батырма жасырулы тұрады.
        </p>
        <div className="mt-4">
          <PushSubscribeButton />
        </div>
      </section>
    </div>
  );
}

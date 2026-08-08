import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function ReaderSettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/kiru");

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <Link href="/baptaular" className="text-sm text-muted hover:text-gold-600">
        ← Баптау
      </Link>
      <h1 className="mt-4 font-display text-3xl">Оқу параметрлері</h1>

      <p className="mt-6 text-muted">
        Қаріп, өлшем, жол аралығы және фон түсі (ақ/сепия/қара) — кез
        келген тарау бетінің жоғарғы жағындағы <strong>«Aa»</strong>
        батырмасында реттеледі. Таңдауыңыз браузерде сақталады және
        келесі оқығанда автоматты қолданылады.
      </p>

      <div className="mt-6">
        <Link href="/kitaptar" className="btn-secondary text-sm">
          Кітап ашып көру
        </Link>
      </div>

      <div className="nib-divider" />

      <section>
        <h2 className="font-display text-lg">Парақтау форматы</h2>
        <p className="mt-2 text-sm text-muted">
          Қазір тек шексіз орау (infinite scroll) бар. Кітап сияқты
          екі беттік парақтау режимі — жоспарда.
        </p>
      </section>

      <div className="nib-divider" />

      <section>
        <h2 className="font-display text-lg">Экранның сөнбеуі</h2>
        <p className="mt-2 text-sm text-muted">Жоспарда — әлі жасалмады.</p>
      </section>
    </div>
  );
}

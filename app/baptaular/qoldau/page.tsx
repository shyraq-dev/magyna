import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SupportTicketForm from "@/components/SupportTicketForm";

const FAQ = [
  {
    q: "Кітапты қалай сөреме қосамын?",
    a: "Кітап бетінде «Сөреме қосу» батырмасын басыңыз.",
  },
  {
    q: "Автор бола аламын ба?",
    a: "Әзірге жазу мүмкіндігі әкімші тарапынан бекітілген пайдаланушыларға ғана ашық.",
  },
  {
    q: "Оқу баптауларын қалай өзгертемін?",
    a: "Тарау бетінде жоғарыдағы «Aa» батырмасын басыңыз — қаріп, өлшем, тема сол жерде.",
  },
];

export default async function SupportSettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/kiru");

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <Link href="/baptaular" className="text-sm text-muted hover:text-gold-600">
        ← Баптаулар
      </Link>
      <h1 className="mt-4 font-display text-3xl">Ақпарат және қолдау</h1>

      <section className="mt-8">
        <h2 className="font-display text-xl">Жиі қойылатын сұрақтар</h2>
        <dl className="mt-4 space-y-4">
          {FAQ.map((item) => (
            <div key={item.q}>
              <dt className="font-medium">{item.q}</dt>
              <dd className="mt-1 text-sm text-muted">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="nib-divider" />

      <section>
        <h2 className="font-display text-xl">Қолдау қызметіне жазу</h2>
        <div className="mt-4">
          <SupportTicketForm />
        </div>
      </section>

      <div className="nib-divider" />

      <section className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
        <div className="flex gap-4">
          <Link href="/baptaular/kupiyalyk" className="hover:text-gold-600">
            Құпиялық саясаты
          </Link>
          <Link href="/baptaular/erezheler" className="hover:text-gold-600">
            Пайдалану шарты
          </Link>
        </div>
        <span>Maǵyna v1.0.0</span>
      </section>
    </div>
  );
}

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

function StatusPill({ status }: { status: "draft" | "published" }) {
  return (
    <span
      className={
        status === "published"
          ? "rounded-sm border border-gold-500 bg-gold-300/10 px-2 py-0.5 text-xs text-gold-600"
          : "rounded-sm border border-line bg-paper-dim px-2 py-0.5 text-xs text-muted"
      }
    >
      {status === "published" ? "Жарияланған" : "Жоба"}
    </span>
  );
}

export default async function KabinetPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: books } = await supabase
    .from("books")
    .select("id, slug, title, status")
    .eq("author_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl">Жазушы кабинеті</h1>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/jazushy/dorama"
            className="btn-secondary text-sm"
          >
            Дорама
          </Link>
          <Link
            href="/jazushy/kitap/jana"
            className="btn-primary"
          >
            + Жаңа кітап
          </Link>
        </div>
      </div>

      <h2 className="mt-10 font-display text-xl">Менің кітаптарым</h2>
      <ul className="mt-4 divide-y divide-line">
        {books?.length ? (
          books.map((b: any) => (
            <li key={b.id}>
              <Link
                href={`/jazushy/kitap/${b.slug}`}
                className="flex items-center justify-between py-4 hover:text-gold-600"
              >
                <span className="font-display">{b.title}</span>
                <StatusPill status={b.status} />
              </Link>
            </li>
          ))
        ) : (
          <p className="py-4 text-muted">Әлі кітап қосылмаған.</p>
        )}
      </ul>
    </div>
  );
}

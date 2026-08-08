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

export default async function AdminDoramaListPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: doramas } = await supabase
    .from("doramas")
    .select("id, slug, title, status")
    .eq("created_by", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/jazushy" className="text-sm text-muted hover:text-gold-600">
        ← Жазушы кабинеті
      </Link>
      <div className="mt-4 flex items-center justify-between">
        <h1 className="font-display text-3xl">Дорама</h1>
        <Link
          href="/jazushy/dorama/jana"
          className="btn-primary"
        >
          + Жаңа дорама
        </Link>
      </div>

      <ul className="mt-10 divide-y divide-line">
        {doramas?.length ? (
          doramas.map((d: any) => (
            <li key={d.id}>
              <Link
                href={`/jazushy/dorama/${d.slug}`}
                className="flex items-center justify-between py-4 hover:text-gold-600"
              >
                <span className="font-display">{d.title}</span>
                <StatusPill status={d.status} />
              </Link>
            </li>
          ))
        ) : (
          <p className="py-4 text-muted">Әлі дорама қосылмаған.</p>
        )}
      </ul>
    </div>
  );
}

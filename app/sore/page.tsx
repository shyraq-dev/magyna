import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import BookCard from "@/components/BookCard";
import PushSubscribeButton from "@/components/PushSubscribeButton";

export default async function SorePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null; // middleware already redirects to /kiru

  const { data: shelfBooks } = await supabase
    .from("shelf")
    .select("book_id, books(slug, title, description, cover_url)")
    .eq("user_id", user.id)
    .order("added_at", { ascending: false });

  const { data: progressRows } = await supabase
    .from("reading_progress")
    .select("book_id, position")
    .eq("user_id", user.id);

  const progressByBook = new Map(
    (progressRows ?? []).map((p) => [p.book_id, p.position])
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Менің сөрем</h1>
          <p className="mt-2 text-muted">Сақтаған кітаптарыңыз</p>
        </div>
        <PushSubscribeButton />
      </div>

      <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
        {shelfBooks?.length ? (
          shelfBooks.map((row: any) => (
            <BookCard
              key={row.book_id}
              slug={row.books.slug}
              title={row.books.title}
              description={row.books.description}
              coverUrl={row.books.cover_url}
              progress={progressByBook.get(row.book_id) ?? 0}
            />
          ))
        ) : (
          <div className="col-span-full empty-state">
            <span className="empty-state-icon" aria-hidden="true">
              📚
            </span>
            <div>
              <p className="font-display text-lg">Сөреңіз әлі бос</p>
              <p className="mt-1 text-sm text-muted">
                <Link href="/kitaptar" className="text-gold-600 underline">
                  Кітаптар
                </Link>{" "}
                бетінен ұнағанын қосыңыз.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

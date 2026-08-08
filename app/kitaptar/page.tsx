import { createClient } from "@/lib/supabase/server";
import BookCard from "@/components/BookCard";

export default async function KitaptarPage() {
  const supabase = createClient();
  const { data: books } = await supabase
    .from("books")
    .select("slug, title, description, cover_url")
    .eq("status", "published")
    .order("title");

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-3xl">Кітаптар</h1>
      <p className="mt-2 text-muted">Барлық жарияланған туындылар</p>

      <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
        {books?.length ? (
          books.map((b) => (
            <BookCard
              key={b.slug}
              slug={b.slug}
              title={b.title}
              description={b.description}
              coverUrl={b.cover_url}
            />
          ))
        ) : (
          <div className="col-span-full empty-state">
            <span className="empty-state-icon" aria-hidden="true">
              📚
            </span>
            <div>
              <p className="font-display text-lg">Әзірге кітап жоқ</p>
              <p className="mt-1 text-sm text-muted">
                Жақында жаңа туындылар осында пайда болады.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

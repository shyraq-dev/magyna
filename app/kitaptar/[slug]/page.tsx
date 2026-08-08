import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ShelfButton from "@/components/ShelfButton";
import CommentSection from "@/components/CommentSection";
import StarRating from "@/components/StarRating";

export default async function BookPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();

  const { data: book } = await supabase
    .from("books")
    .select("id, slug, title, description, cover_url")
    .eq("slug", params.slug)
    .eq("status", "published")
    .single();

  if (!book) notFound();

  const { data: chapters } = await supabase
    .from("chapters")
    .select("id, chapter_number, title")
    .eq("book_id", book.id)
    .order("chapter_number");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let onShelf = false;
  if (user) {
    const { data: shelfRow } = await supabase
      .from("shelf")
      .select("book_id")
      .eq("user_id", user.id)
      .eq("book_id", book.id)
      .maybeSingle();
    onShelf = !!shelfRow;
  }

  const { data: ratings } = await supabase
    .from("book_ratings")
    .select("rating")
    .eq("book_id", book.id);

  const ratingCount = ratings?.length ?? 0;
  const averageRating = ratingCount
    ? ratings!.reduce((sum: number, r: any) => sum + r.rating, 0) / ratingCount
    : 0;

  let myRating = 0;
  if (user) {
    const { data: mine } = await supabase
      .from("book_ratings")
      .select("rating")
      .eq("book_id", book.id)
      .eq("user_id", user.id)
      .maybeSingle();
    myRating = mine?.rating ?? 0;
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="flex flex-col gap-8 sm:flex-row">
        {book.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={book.cover_url}
            alt={book.title}
            className="aspect-[2/3] w-40 shrink-0 rounded-sm object-cover"
          />
        ) : (
          <div className="aspect-[2/3] w-40 shrink-0 rounded-sm bg-ink" />
        )}
        <div>
          <h1 className="font-display text-3xl">{book.title}</h1>
          {book.description && (
            <p className="mt-4 text-muted">{book.description}</p>
          )}
          <div className="mt-4">
            <StarRating
              bookId={book.id}
              average={averageRating}
              count={ratingCount}
              initialMyRating={myRating}
              loggedIn={!!user}
            />
          </div>
          <div className="mt-6">
            <ShelfButton bookId={book.id} initialOnShelf={onShelf} loggedIn={!!user} />
          </div>
        </div>
      </div>

      <div className="nib-divider" />

      <h2 className="font-display text-xl">Тараулар</h2>
      <ol className="mt-6 divide-y divide-line">
        {chapters?.length ? (
          chapters.map((c) => (
            <li key={c.id}>
              <Link
                href={`/kitaptar/${book.slug}/${c.chapter_number}`}
                className="flex items-center justify-between py-4 hover:text-gold-600"
              >
                <span>
                  {c.chapter_number}-тарау. {c.title}
                </span>
                <span aria-hidden="true">→</span>
              </Link>
            </li>
          ))
        ) : (
          <p className="py-4 text-muted">Тараулар әлі қосылмаған.</p>
        )}
      </ol>

      <div className="nib-divider" />

      <CommentSection bookId={book.id} loggedIn={!!user} />
    </div>
  );
}

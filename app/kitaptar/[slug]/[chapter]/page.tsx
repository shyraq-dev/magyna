import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import ReadingTracker from "@/components/ReadingTracker";
import ReaderView from "@/components/ReaderView";
import ChapterLikeButton from "@/components/ChapterLikeButton";
import { extractToc } from "@/lib/markdown/toc";

export default async function ChapterPage({
  params,
}: {
  params: { slug: string; chapter: string };
}) {
  const supabase = createClient();

  const { data: book } = await supabase
    .from("books")
    .select("id, slug, title")
    .eq("slug", params.slug)
    .single();

  if (!book) notFound();

  const { data: chapter } = await supabase
    .from("chapters")
    .select("id, chapter_number, title, content")
    .eq("book_id", book.id)
    .eq("chapter_number", Number(params.chapter))
    .single();

  if (!chapter) notFound();

  const { count: totalChapters } = await supabase
    .from("chapters")
    .select("id", { count: "exact", head: true })
    .eq("book_id", book.id);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Atomic view counter (feeds the "Көп оқылатын туынды" badge) — uses
  // the service-role client since only the admin/author can normally
  // write to chapters; this bypasses that via a narrow RPC function
  // instead of opening chapters up to public writes.
  const admin = createAdminClient();
  await admin.rpc("increment_chapter_views", { p_chapter_id: chapter.id });

  const { count: likeCount } = await supabase
    .from("chapter_likes")
    .select("user_id", { count: "exact", head: true })
    .eq("chapter_id", chapter.id);

  let likedByMe = false;
  if (user) {
    const { data: likeRow } = await supabase
      .from("chapter_likes")
      .select("user_id")
      .eq("chapter_id", chapter.id)
      .eq("user_id", user.id)
      .maybeSingle();
    likedByMe = !!likeRow;
  }

  return (
    <article className="mx-auto max-w-2xl px-6 py-16">
      <Link href={`/kitaptar/${book.slug}`} className="text-sm text-muted hover:text-gold-600">
        ← {book.title}
      </Link>
      <h1 className="mt-4 font-display text-3xl">
        {chapter.chapter_number}-тарау. {chapter.title}
      </h1>

      <div className="nib-divider" />

      <ReaderView toc={extractToc(chapter.content)} content={chapter.content} />

      <div className="mt-10 flex justify-center">
        <ChapterLikeButton
          chapterId={chapter.id}
          initialLiked={likedByMe}
          initialCount={likeCount ?? 0}
          loggedIn={!!user}
        />
      </div>

      {user && (
        <ReadingTracker
          userId={user.id}
          bookId={book.id}
          chapterId={chapter.id}
          isLastChapter={chapter.chapter_number === (totalChapters ?? 0)}
        />
      )}
    </article>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PublishToggle from "@/components/admin/PublishToggle";
import ChapterForm from "@/components/admin/ChapterForm";
import ChapterList from "@/components/admin/ChapterList";
import CoverUpload from "@/components/admin/CoverUpload";
import BookFieldsForm from "@/components/admin/BookFieldsForm";
import DeleteBookButton from "@/components/admin/DeleteBookButton";

export default async function AdminBookPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: book } = await supabase
    .from("books")
    .select("id, slug, title, description, status, cover_url")
    .eq("slug", params.slug)
    .eq("author_id", user!.id)
    .single();

  if (!book) notFound();

  const { data: chapters } = await supabase
    .from("chapters")
    .select("id, chapter_number, title, content")
    .eq("book_id", book.id)
    .order("chapter_number");

  const nextChapterNumber = (chapters?.at(-1)?.chapter_number ?? 0) + 1;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/jazushy" className="text-sm text-muted hover:text-gold-600">
        ← Жазушы кабинеті
      </Link>
      <div className="mt-4 flex items-start justify-between gap-6">
        <h1 className="font-display text-3xl">{book.title}</h1>
        <div className="flex shrink-0 gap-3">
          <PublishToggle bookId={book.id} bookTitle={book.title} bookSlug={book.slug} status={book.status} />
          <DeleteBookButton bookId={book.id} />
        </div>
      </div>

      <div className="nib-divider" />

      <h2 className="font-display text-xl">Мәліметтер</h2>
      <BookFieldsForm bookId={book.id} initial={{ title: book.title, description: book.description }} />

      <div className="nib-divider" />

      <h2 className="font-display text-xl">Мұқаба</h2>
      <div className="mt-4">
        <CoverUpload bookId={book.id} currentCoverUrl={book.cover_url} />
      </div>

      <div className="nib-divider" />

      <h2 className="font-display text-xl">Тараулар</h2>
      <ChapterList chapters={chapters ?? []} />

      <div className="nib-divider" />

      <h2 className="font-display text-xl">Жаңа тарау қосу</h2>
      <ChapterForm
        bookId={book.id}
        bookTitle={book.title}
        bookSlug={book.slug}
        bookStatus={book.status}
        nextChapterNumber={nextChapterNumber}
      />
    </div>
  );
}

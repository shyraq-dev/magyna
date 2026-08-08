import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ReportActions from "@/components/admin/ReportActions";

const REASON_LABELS: Record<string, string> = {
  plagiarism: "Плагиат",
  profanity: "Балағат сөз",
  spam: "Спам",
  other: "Басқа себеп",
};

export default async function AdminReportsPage() {
  const supabase = createClient();

  const { data: reports } = await supabase
    .from("reports")
    .select("id, target_id, reason, created_at, reporter_id")
    .eq("target_type", "comment")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const commentIds = [...new Set((reports ?? []).map((r: any) => r.target_id))];
  const reporterIds = [...new Set((reports ?? []).map((r: any) => r.reporter_id))];

  const { data: comments } = commentIds.length
    ? await supabase.from("comments").select("id, content, book_id, user_id").in("id", commentIds)
    : { data: [] as any[] };

  const bookIds = [...new Set((comments ?? []).map((c: any) => c.book_id))];
  const commentAuthorIds = [...new Set((comments ?? []).map((c: any) => c.user_id))];

  const { data: books } = bookIds.length
    ? await supabase.from("books").select("id, title, slug").in("id", bookIds)
    : { data: [] as any[] };

  const { data: people } = (reporterIds.length || commentAuthorIds.length)
    ? await supabase
        .from("profiles")
        .select("id, username")
        .in("id", [...new Set([...reporterIds, ...commentAuthorIds])])
    : { data: [] as any[] };

  const commentById = new Map((comments ?? []).map((c: any) => [c.id, c]));
  const bookById = new Map((books ?? []).map((b: any) => [b.id, b]));
  const usernameById = new Map((people ?? []).map((p: any) => [p.id, p.username]));

  const rows = (reports ?? [])
    .map((r: any) => {
      const comment = commentById.get(r.target_id);
      if (!comment) return null; // already deleted
      const book = bookById.get(comment.book_id);
      return {
        reportId: r.id,
        reason: r.reason,
        createdAt: r.created_at,
        reporterName: usernameById.get(r.reporter_id) ?? "белгісіз",
        commentId: comment.id,
        commentContent: comment.content,
        commentAuthor: usernameById.get(comment.user_id) ?? "белгісіз",
        bookTitle: book?.title ?? "белгісіз кітап",
        bookSlug: book?.slug,
      };
    })
    .filter((row: any): row is NonNullable<typeof row> => row !== null);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/avtor" className="text-sm text-muted hover:text-gold-600">
        ← Автор кабинеті
      </Link>
      <h1 className="mt-4 font-display text-3xl">Шағымдар</h1>
      <p className="mt-2 text-muted">Қарауды күтіп тұрған: {rows.length}</p>

      <ul className="mt-8 divide-y divide-line">
        {rows.length === 0 && (
          <p className="py-6 text-muted">Қазір шағым жоқ.</p>
        )}
        {rows.map((row: any) => (
          <li key={row.reportId} className="space-y-3 py-6">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="text-red-700">
                {REASON_LABELS[row.reason] ?? row.reason}
              </span>
              <span className="text-xs text-muted">
                {new Date(row.createdAt).toLocaleString("kk-KZ")}
              </span>
            </div>

            <blockquote className="border-l-2 border-line pl-4 text-sm">
              {row.commentContent}
            </blockquote>

            <p className="text-xs text-muted">
              @{row.commentAuthor} жазды ·{" "}
              {row.bookSlug ? (
                <Link href={`/kitaptar/${row.bookSlug}`} className="hover:text-gold-600">
                  {row.bookTitle}
                </Link>
              ) : (
                row.bookTitle
              )}{" "}
              · шағымданған: @{row.reporterName}
            </p>

            <ReportActions reportId={row.reportId} commentId={row.commentId} />
          </li>
        ))}
      </ul>
    </div>
  );
}

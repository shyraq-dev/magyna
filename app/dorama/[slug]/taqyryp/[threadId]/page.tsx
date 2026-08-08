import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ThreadReplyForm from "@/components/ThreadReplyForm";

export default async function ThreadPage({
  params,
}: {
  params: { slug: string; threadId: string };
}) {
  const supabase = createClient();

  const { data: dorama } = await supabase
    .from("doramas")
    .select("id, slug, title")
    .eq("slug", params.slug)
    .single();

  if (!dorama) notFound();

  const { data: thread } = await supabase
    .from("dorama_threads")
    .select("id, title, created_at, user_id, profiles(username)")
    .eq("id", params.threadId)
    .eq("dorama_id", dorama.id)
    .single();

  if (!thread) notFound();

  const { data: replies } = await supabase
    .from("dorama_thread_replies")
    .select("id, content, created_at, user_id, profiles(username)")
    .eq("thread_id", thread.id)
    .order("created_at", { ascending: true });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link href={`/dorama/${dorama.slug}`} className="text-sm text-muted hover:text-gold-600">
        ← {dorama.title}
      </Link>

      <h1 className="mt-4 font-display text-3xl">{thread.title}</h1>
      <p className="mt-1 text-xs text-muted">
        @{(thread as any).profiles?.username ?? "белгісіз"} ·{" "}
        {new Date(thread.created_at).toLocaleString("kk-KZ")}
      </p>

      <div className="nib-divider" />

      <ul className="space-y-6">
        {replies?.length ? (
          replies.map((r: any) => (
            <li key={r.id} className="border-b border-line pb-6">
              <p className="text-sm font-medium">@{r.profiles?.username ?? "белгісіз"}</p>
              <p className="mt-1">{r.content}</p>
              <p className="mt-2 text-xs text-muted">
                {new Date(r.created_at).toLocaleString("kk-KZ")}
              </p>
            </li>
          ))
        ) : (
          <p className="text-muted">Әзірге жауап жоқ.</p>
        )}
      </ul>

      {user ? (
        <ThreadReplyForm threadId={thread.id} />
      ) : (
        <p className="mt-6 text-sm text-muted">
          Жауап жазу үшін{" "}
          <Link href="/kiru" className="text-gold-600 underline">
            кіріңіз
          </Link>
          .
        </p>
      )}
    </div>
  );
}

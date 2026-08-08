import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPush } from "@/lib/push/send";

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Кіру қажет." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return NextResponse.json({ error: "Рұқсат жоқ." }, { status: 403 });
  }

  const { bookId, title, body, url, broadcast } = await request.json();
  if (!bookId || !title || !body) {
    return NextResponse.json(
      { error: "bookId, title, body қажет." },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  let subs;
  if (broadcast) {
    // New-book announcement — no one could have shelved it yet, so
    // notify everyone who has push enabled.
    const { data } = await admin
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth");
    subs = data;
  } else {
    // New-chapter announcement — only notify readers who shelved this book.
    const { data: shelfRows } = await admin
      .from("shelf")
      .select("user_id")
      .eq("book_id", bookId);

    const userIds = (shelfRows ?? []).map((r) => r.user_id);
    if (userIds.length === 0) {
      return NextResponse.json({ sent: 0, removed: 0 });
    }

    const { data } = await admin
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .in("user_id", userIds);
    subs = data;
  }

  let sent = 0;
  let removed = 0;

  for (const sub of subs ?? []) {
    const result = await sendPush(sub, { title, body, url });
    if (result === "ok") sent++;
    if (result === "gone") {
      removed++;
      await admin.from("push_subscriptions").delete().eq("id", sub.id);
    }
  }

  return NextResponse.json({ sent, removed });
}

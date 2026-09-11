import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Supabase Auth's own ban_duration mechanism — "none" clears a ban,
// any other value bans the account for that long starting now. There's
// no literal "forever" value, so a very long duration stands in for a
// permanent ban.
const DURATIONS: Record<string, string> = {
  "3d": "72h",
  "1w": "168h",
  permanent: "87600h", // ~10 years
  none: "none",
};

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

  const { userId, duration } = await request.json();
  if (!userId || !DURATIONS[duration]) {
    return NextResponse.json({ error: "Жарамсыз сұрау." }, { status: 400 });
  }

  if (userId === user.id) {
    return NextResponse.json(
      { error: "Өз тіркелгіңізді бұғаттай алмайсыз." },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: DURATIONS[duration],
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

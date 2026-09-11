import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST() {
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

  if (profile?.is_admin) {
    return NextResponse.json(
      { error: "Бас автор тіркелгісін бұл жерден өшіру мүмкін емес." },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  // Deleting the auth user cascades to profiles (and from there to
  // shelf/comments/ratings/etc.) via the on-delete-cascade foreign keys
  // already set up in schema.sql.
  const { error } = await admin.auth.admin.deleteUser(user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

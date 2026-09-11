import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyTelegramInitData } from "@/lib/telegram/verify";

export async function POST(request: Request) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json(
        { error: "TELEGRAM_BOT_TOKEN серверде орнатылмаған." },
        { status: 500 }
      );
    }

    const { initData } = await request.json();
    if (typeof initData !== "string" || !initData) {
      return NextResponse.json({ error: "initData жоқ." }, { status: 400 });
    }

    const tgUser = verifyTelegramInitData(initData, botToken);
    if (!tgUser) {
      return NextResponse.json(
        { error: "Telegram деректері расталмады." },
        { status: 401 }
      );
    }

    const admin = createAdminClient();
    const placeholderEmail = `tg${tgUser.id}@telegram.magyna.local`;
    const username = tgUser.username || `qonaq${tgUser.id}`;
    const fullName = [tgUser.first_name, tgUser.last_name]
      .filter(Boolean)
      .join(" ");

    // generateLink creates the auth user on first use (with the given
    // metadata via options.data) and simply issues a fresh link for an
    // existing user on repeat logins — using the same deterministic
    // placeholder email for both cases makes this whole route idempotent
    // and removes the separate createUser call (and the race it had
    // between concurrent requests hitting the same email).
    const { data: link, error: linkError } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email: placeholderEmail,
      options: {
        data: {
          username,
          full_name: fullName || null,
          telegram_id: tgUser.id,
          avatar_url: tgUser.photo_url || null,
        },
      },
    });

    if (linkError || !link) {
      console.error("Telegram auth: generateLink failed", linkError);
      return NextResponse.json(
        {
          error:
            linkError?.message || "Кіру сілтемесін жасау сәтсіз аяқталды.",
        },
        { status: 500 }
      );
    }

    // Keep telegram_id/avatar in sync even for returning users (e.g. if
    // their Telegram photo changed, or the profile predates this column
    // set from an earlier schema version).
    await admin
      .from("profiles")
      .update({
        telegram_id: tgUser.id,
        avatar_url: tgUser.photo_url || null,
      })
      .eq("id", link.user.id);

    return NextResponse.json({
      token_hash: link.properties.hashed_token,
      user_id: link.user.id,
    });
  } catch (err: any) {
    console.error("Telegram auth route crashed", err);
    return NextResponse.json(
      { error: err?.message || "Күтпеген қате шықты." },
      { status: 500 }
    );
  }
}

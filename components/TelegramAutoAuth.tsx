"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        ready: () => void;
        expand: () => void;
      };
    };
  }
}

export default function TelegramAutoAuth() {
  const router = useRouter();
  const supabase = createClient();
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;

    async function run() {
      const webApp = window.Telegram?.WebApp;
      if (!webApp?.initData) return; // not opened inside Telegram
      webApp.ready();

      try {
        // Always ask the server who this initData actually belongs to —
        // never assume an existing browser session is still correct.
        // Telegram Mini Apps share one WebView storage per device, not
        // per Telegram account, so switching accounts inside Telegram
        // leaves the OLD Supabase session sitting in that storage; only
        // comparing ids (not just "is anyone logged in") catches that.
        const res = await fetch("/api/auth/telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ initData: webApp.initData }),
        });
        if (!res.ok) return; // fail silently — email/password login still works

        const { token_hash, user_id } = await res.json();

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user?.id === user_id) {
          return; // already the right account — nothing to do
        }

        if (session) {
          // A stale session for a DIFFERENT Telegram account is present —
          // clear it before signing in as the correct one.
          await supabase.auth.signOut();
        }

        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type: "email",
        });
        if (!error) router.refresh();
      } catch {
        // Silent by design — this is a background convenience login, not
        // a blocking flow the person has to watch or retry.
      }
    }

    run();
  }, [router, supabase]);

  return null;
}

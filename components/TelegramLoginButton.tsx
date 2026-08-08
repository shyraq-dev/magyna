"use client";

import { useEffect, useState } from "react";
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

export default function TelegramLoginButton() {
  const router = useRouter();
  const supabase = createClient();
  const [status, setStatus] = useState<"idle" | "checking" | "loading" | "error">(
    "checking"
  );
  const [available, setAvailable] = useState(false);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  useEffect(() => {
    // The Telegram WebApp bridge is only present when the page is
    // actually opened from inside Telegram (as a Mini App).
    const webApp = window.Telegram?.WebApp;
    if (webApp?.initData) {
      webApp.ready();
      setAvailable(true);
      setStatus("idle");
    } else {
      setStatus("idle");
    }
  }, []);

  async function loginWithTelegram() {
    if (status === "loading") return; // guard against double-taps
    const initData = window.Telegram?.WebApp?.initData;
    if (!initData) return;

    setStatus("loading");
    setErrorDetail(null);

    let res: Response;
    try {
      res = await fetch("/api/auth/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData }),
      });
    } catch {
      setStatus("error");
      setErrorDetail("Желі қатесі. Байланысты тексеріп қайталаңыз.");
      return;
    }

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setStatus("error");
      setErrorDetail(body?.error || `Сервер қатесі (${res.status}).`);
      return;
    }

    const { token_hash } = await res.json();
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: "email",
    });

    if (error) {
      setStatus("error");
      setErrorDetail(error.message);
      return;
    }

    router.push("/sore");
    router.refresh();
  }

  if (!available) return null;

  return (
    <div className="mt-4">
      <button
        onClick={loginWithTelegram}
        disabled={status === "loading"}
        className="w-full rounded-sm border border-line bg-white px-5 py-3 text-sm transition hover:border-gold-500 disabled:opacity-60"
      >
        {status === "loading" ? "Telegram арқылы кіруде..." : "Telegram арқылы кіру"}
      </button>
      {status === "error" && (
        <p className="mt-2 text-sm text-red-700">
          Telegram арқылы кіру сәтсіз аяқталды{errorDetail ? `: ${errorDetail}` : ""}.
          Қайталап көріңіз немесе email/құпия сөзбен кіріңіз.
        </p>
      )}
    </div>
  );
}

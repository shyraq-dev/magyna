"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AvatarCropUpload from "@/components/AvatarCropUpload";

export default function QuickAvatarUpload({
  userId,
  currentAvatarUrl,
}: {
  userId: string;
  currentAvatarUrl: string | null;
}) {
  const router = useRouter();
  const supabase = createClient();

  return (
    <AvatarCropUpload
      userId={userId}
      currentAvatarUrl={currentAvatarUrl}
      onUploaded={async (url) => {
        await supabase.from("profiles").update({ avatar_url: url }).eq("id", userId);
        router.refresh();
      }}
      trigger={(open) => (
        <button
          type="button"
          onClick={open}
          className="flex w-full items-center gap-3 py-2 text-left text-sm text-muted transition hover:text-gold-600"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="13" r="3.2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M16 10.5h1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </span>
          Сурет қою
        </button>
      )}
    />
  );
}

"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const MAX_SIZE_MB = 5;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

export default function WallpaperUpload({
  userId,
  currentWallpaperUrl,
}: {
  userId: string;
  currentWallpaperUrl: string | null;
}) {
  const router = useRouter();
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(currentWallpaperUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    if (!ACCEPTED.includes(file.type)) {
      setError("Тек JPEG, PNG немесе WebP форматы қабылданады.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Файл өлшемі ${MAX_SIZE_MB}МБ-тан аспауы керек.`);
      return;
    }

    setLoading(true);
    const ext = file.name.split(".").pop();
    const path = `${userId}/wallpaper.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, cacheControl: "3600" });

    if (uploadError) {
      setLoading(false);
      setError("Жүктеу сәтсіз аяқталды. Қайталап көріңіз.");
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(path);
    const bustedUrl = `${publicUrl}?v=${Date.now()}`;

    await supabase.from("profiles").update({ wallpaper_url: bustedUrl }).eq("id", userId);

    setLoading(false);
    setPreview(bustedUrl);
    router.refresh();
  }

  return (
    <div className="relative -mx-6 sm:-mx-24 lg:-mx-32">
      <div className="h-36 w-full overflow-hidden rounded-sm bg-nib-gradient sm:h-48">
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-full w-full object-cover" />
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="absolute bottom-2 right-2 rounded-sm bg-ink/70 px-3 py-1.5 text-xs text-paper backdrop-blur transition hover:bg-ink disabled:opacity-60"
      >
        {loading ? "Жүктелуде..." : "Тұсқағаз қою"}
      </button>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}

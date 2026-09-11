"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

const MAX_SIZE_MB = 5;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

export default function CoverUpload({
  bookId,
  currentCoverUrl,
}: {
  bookId: string;
  currentCoverUrl: string | null;
}) {
  const router = useRouter();
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(currentCoverUrl);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    const path = `${bookId}/cover.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("covers")
      .upload(path, file, { upsert: true, cacheControl: "3600" });

    if (uploadError) {
      setLoading(false);
      setError("Жүктеу сәтсіз аяқталды. Қайталап көріңіз.");
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("covers").getPublicUrl(path);

    // Cache-bust so the new cover shows immediately even though the
    // path (and therefore the previous public URL) is identical.
    const bustedUrl = `${publicUrl}?v=${Date.now()}`;

    const { error: updateError } = await supabase
      .from("books")
      .update({ cover_url: bustedUrl })
      .eq("id", bookId);

    setLoading(false);
    if (updateError) {
      setError("Мұқаба сақталмады. Қайталап көріңіз.");
      return;
    }

    setPreview(bustedUrl);
    router.refresh();
  }

  return (
    <div className="flex items-start gap-5">
      <div className="relative aspect-[2/3] w-28 shrink-0 overflow-hidden rounded-sm bg-ink">
        {preview && (
          <Image src={preview} alt="Мұқаба" fill className="object-cover" sizes="112px" />
        )}
      </div>

      <div>
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
          className="btn-secondary text-sm disabled:opacity-60"
        >
          {loading ? "Жүктелуде..." : preview ? "Мұқабаны ауыстыру" : "Мұқаба жүктеу"}
        </button>
        <p className="mt-2 text-xs text-muted">JPEG, PNG немесе WebP · 5МБ-қа дейін</p>
        {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
      </div>
    </div>
  );
}

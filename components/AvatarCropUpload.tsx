"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

const VIEWPORT = 220; // CSS px, square crop viewport
const OUTPUT = 480; // px, exported square size
const MAX_SIZE_MB = 5;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

export default function AvatarCropUpload({
  userId,
  currentAvatarUrl,
  onUploaded,
  trigger,
}: {
  userId: string;
  currentAvatarUrl: string | null;
  onUploaded: (url: string) => void;
  /** Optional custom trigger (e.g. a compact icon-button elsewhere on the
   *  page) that opens the same file picker instead of the default
   *  avatar-preview-plus-button idle state. */
  trigger?: (open: () => void) => React.ReactNode;
}) {
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const dragState = useRef<{ x: number; y: number } | null>(null);

  const [preview, setPreview] = useState<string | null>(currentAvatarUrl);
  const [editingSrc, setEditingSrc] = useState<string | null>(null);
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function baseScale(w: number, h: number) {
    return Math.max(VIEWPORT / w, VIEWPORT / h);
  }

  function clampOffset(x: number, y: number, scale: number) {
    const dispW = natural.w * scale;
    const dispH = natural.h * scale;
    const maxX = Math.max(0, (dispW - VIEWPORT) / 2);
    const maxY = Math.max(0, (dispH - VIEWPORT) / 2);
    return {
      x: Math.min(maxX, Math.max(-maxX, x)),
      y: Math.min(maxY, Math.max(-maxY, y)),
    };
  }

  function handleFile(file: File) {
    setError(null);
    if (!ACCEPTED.includes(file.type)) {
      setError("Тек JPEG, PNG немесе WebP форматы қабылданады.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Файл өлшемі ${MAX_SIZE_MB}МБ-тан аспауы керек.`);
      return;
    }
    const url = URL.createObjectURL(file);
    setEditingSrc(url);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }

  function onImgLoad() {
    const img = imgRef.current;
    if (!img) return;
    setNatural({ w: img.naturalWidth, h: img.naturalHeight });
  }

  function onPointerDown(e: React.PointerEvent) {
    (e.target as Element).setPointerCapture(e.pointerId);
    dragState.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragState.current) return;
    const scale = baseScale(natural.w, natural.h) * zoom;
    const next = clampOffset(
      e.clientX - dragState.current.x,
      e.clientY - dragState.current.y,
      scale
    );
    setOffset(next);
  }
  function onPointerUp() {
    dragState.current = null;
  }

  function onZoomChange(next: number) {
    const scale = baseScale(natural.w, natural.h) * next;
    setZoom(next);
    setOffset(clampOffset(offset.x, offset.y, scale));
  }

  async function confirmCrop() {
    const img = imgRef.current;
    if (!img || !natural.w) return;

    setLoading(true);
    setError(null);

    const scale = baseScale(natural.w, natural.h) * zoom;
    const dispW = natural.w * scale;
    const dispH = natural.h * scale;
    const displayedLeft = VIEWPORT / 2 - dispW / 2 + offset.x;
    const displayedTop = VIEWPORT / 2 - dispH / 2 + offset.y;

    const srcX = (0 - displayedLeft) / scale;
    const srcY = (0 - displayedTop) / scale;
    const srcSize = VIEWPORT / scale;

    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT;
    canvas.height = OUTPUT;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setLoading(false);
      return;
    }
    ctx.drawImage(img, srcX, srcY, srcSize, srcSize, 0, 0, OUTPUT, OUTPUT);

    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          setLoading(false);
          setError("Кесу сәтсіз аяқталды.");
          return;
        }

        const path = `${userId}/avatar.jpg`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, blob, {
            upsert: true,
            cacheControl: "3600",
            contentType: "image/jpeg",
          });

        if (uploadError) {
          setLoading(false);
          setError("Жүктеу сәтсіз аяқталды. Қайталап көріңіз.");
          return;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("avatars").getPublicUrl(path);
        const bustedUrl = `${publicUrl}?v=${Date.now()}`;

        setLoading(false);
        setPreview(bustedUrl);
        setEditingSrc(null);
        onUploaded(bustedUrl);
      },
      "image/jpeg",
      0.9
    );
  }

  const scale = natural.w ? baseScale(natural.w, natural.h) * zoom : 1;

  return (
    <div>
      {editingSrc ? (
        <div>
          <div
            className="relative mx-auto overflow-hidden rounded-full bg-ink"
            style={{ width: VIEWPORT, height: VIEWPORT, touchAction: "none" }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={editingSrc}
              alt=""
              onLoad={onImgLoad}
              draggable={false}
              className="pointer-events-none absolute select-none"
              style={
                natural.w
                  ? {
                      width: natural.w * scale,
                      height: natural.h * scale,
                      left: VIEWPORT / 2 - (natural.w * scale) / 2 + offset.x,
                      top: VIEWPORT / 2 - (natural.h * scale) / 2 + offset.y,
                    }
                  : undefined
              }
            />
          </div>

          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => onZoomChange(Number(e.target.value))}
            className="mx-auto mt-3 block w-[220px]"
            aria-label="Үлкейту"
          />

          <div className="mt-3 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => setEditingSrc(null)}
              className="btn-secondary text-sm"
            >
              Бас тарту
            </button>
            <button
              type="button"
              onClick={confirmCrop}
              disabled={loading}
              className="btn-primary px-4 py-2 text-sm disabled:opacity-60"
            >
              {loading ? "Жүктелуде..." : "Сақтау"}
            </button>
          </div>
        </div>
      ) : (
        <>
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
          {trigger ? (
            trigger(() => inputRef.current?.click())
          ) : (
            <div className="flex items-center gap-5">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-nib-gradient">
                {preview && (
                  <Image src={preview} alt="Аватар" fill className="object-cover" sizes="80px" />
                )}
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="btn-secondary text-sm"
                >
                  {preview ? "Аватарды ауыстыру" : "Аватар жүктеу"}
                </button>
                <p className="mt-2 text-xs text-muted">JPEG, PNG немесе WebP · 5МБ-қа дейін</p>
              </div>
            </div>
          )}
        </>
      )}
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}

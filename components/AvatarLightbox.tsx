"use client";

import { useState } from "react";

export default function AvatarLightbox({
  avatarUrl,
  initial,
}: {
  avatarUrl: string | null;
  initial: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => avatarUrl && setOpen(true)}
        aria-label="Аватарды үлкейтіп көру"
        className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-nib-gradient font-display text-2xl text-ink"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          initial
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6"
        >
          <button
            aria-label="Жабу"
            onClick={() => setOpen(false)}
            className="absolute right-5 top-5 text-2xl text-white"
          >
            ×
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarUrl!}
            alt=""
            className="max-h-[80vh] max-w-[90vw] rounded-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

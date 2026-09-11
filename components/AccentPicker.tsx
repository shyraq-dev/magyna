"use client";

import { useEffect, useState } from "react";

type Accent = "gold" | "navy" | "charcoal";
const STORAGE_KEY = "magyna:accent";

const OPTIONS: { value: Accent; label: string; swatch: string }[] = [
  { value: "gold", label: "Алтын сары", swatch: "#C79A4B" },
  { value: "navy", label: "Сия-көк", swatch: "#2B3A67" },
  { value: "charcoal", label: "Классикалық қара", swatch: "#2A2A2A" },
];

export default function AccentPicker() {
  const [accent, setAccent] = useState<Accent>("gold");

  useEffect(() => {
    const saved = (localStorage.getItem(STORAGE_KEY) as Accent) || "gold";
    setAccent(saved);
    if (saved !== "gold") document.documentElement.setAttribute("data-accent", saved);
  }, []);

  function choose(next: Accent) {
    setAccent(next);
    localStorage.setItem(STORAGE_KEY, next);
    if (next === "gold") {
      document.documentElement.removeAttribute("data-accent");
    } else {
      document.documentElement.setAttribute("data-accent", next);
    }
  }

  return (
    <div className="flex gap-3">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => choose(opt.value)}
          aria-label={opt.label}
          title={opt.label}
          className={
            accent === opt.value
              ? "flex h-9 w-9 items-center justify-center rounded-full ring-2 ring-offset-2 ring-offset-paper"
              : "flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-line"
          }
          style={{ backgroundColor: opt.swatch, ...(accent === opt.value ? ({ "--tw-ring-color": opt.swatch } as any) : {}) }}
        />
      ))}
    </div>
  );
}

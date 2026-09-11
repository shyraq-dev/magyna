"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";
const STORAGE_KEY = "magyna:app-theme";

function apply(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const resolved: Theme =
      saved === "dark"
        ? "dark"
        : saved === "light"
          ? "light"
          : window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
    setTheme(resolved);
    apply(resolved);
    if (saved !== resolved) localStorage.setItem(STORAGE_KEY, resolved);
  }, []);

  function choose(next: Theme) {
    setTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
    apply(next);
  }

  const options: { value: Theme; label: string }[] = [
    { value: "light", label: "☀️ Жарық" },
    { value: "dark", label: "🌙 Қараңғы" },
  ];

  return (
    <div>
      <div className="flex gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => choose(opt.value)}
            className={
              theme === opt.value
                ? "rounded-sm border border-gold-500 bg-gold-300/10 px-3 py-1.5 text-sm text-gold-600"
                : "rounded-sm border border-line px-3 py-1.5 text-sm transition hover:border-gold-500"
            }
          >
            {opt.label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted">
        Әзірге тек негізгі қаптама (навигация, төменгі жол) қараңғы режимге ілінген —
        әр бет толық жабдықталған жоқ.
      </p>
    </div>
  );
}

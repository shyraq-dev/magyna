"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";
const STORAGE_KEY = "magyna:app-theme";

function apply(theme: Theme) {
  const root = document.documentElement;
  const isDark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  root.classList.toggle("dark", isDark);
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const saved = (localStorage.getItem(STORAGE_KEY) as Theme) || "system";
    setTheme(saved);
    apply(saved);
  }, []);

  function choose(next: Theme) {
    setTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
    apply(next);
  }

  const options: { value: Theme; label: string }[] = [
    { value: "light", label: "☀️ Жарық" },
    { value: "dark", label: "🌙 Қараңғы" },
    { value: "system", label: "🖥️ Жүйелік" },
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

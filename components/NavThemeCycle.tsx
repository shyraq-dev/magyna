"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";
const STORAGE_KEY = "magyna:app-theme";
const ICONS: Record<Theme, string> = { light: "🌞", dark: "🌛" };
const LABELS: Record<Theme, string> = {
  light: "Жарық тема — басу арқылы Қараңғыға ауысады",
  dark: "Қараңғы тема — басу арқылы Жарыққа ауысады",
};

function apply(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export default function NavThemeCycle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    // Legacy "system" preference from before the option was removed —
    // resolve it once to whichever it currently renders as.
    const resolved: Theme =
      saved === "dark"
        ? "dark"
        : saved === "light"
          ? "light"
          : window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
    setTheme(resolved);
    if (saved !== resolved) localStorage.setItem(STORAGE_KEY, resolved);
  }, []);

  function toggle() {
    const next: Theme = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
    apply(next);
  }

  return (
    <button
      onClick={toggle}
      aria-label={LABELS[theme]}
      title={LABELS[theme]}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-white text-base transition hover:border-gold-500"
    >
      <span aria-hidden="true">{ICONS[theme]}</span>
    </button>
  );
}

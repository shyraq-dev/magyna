"use client";

import { useEffect, useState } from "react";
import MarkdownContent from "@/components/MarkdownContent";
import TableOfContents from "@/components/TableOfContents";
import type { TocEntry } from "@/lib/markdown/toc";

type FontKey = "serif" | "sans" | "georgia" | "merriweather";
type ThemeKey = "light" | "sepia" | "dark";

const FONT_STACKS: Record<FontKey, string> = {
  serif: "var(--font-display), serif",
  sans: "var(--font-body), sans-serif",
  georgia: "Georgia, 'Times New Roman', serif",
  merriweather: "var(--font-merriweather), serif",
};

const FONT_LABELS: Record<FontKey, string> = {
  serif: "Кітаптық",
  sans: "Қарапайым",
  georgia: "Классикалық",
  merriweather: "Жұмсақ",
};

const THEMES: Record<
  ThemeKey,
  { bg: string; fg: string; muted: string; codeBg: string; border: string; accent: string; label: string }
> = {
  light: {
    bg: "#FBF8F2",
    fg: "#14182B",
    muted: "#6B6355",
    codeBg: "#F3EEE1",
    border: "#E4DCC9",
    accent: "#A97D34",
    label: "Ақ",
  },
  sepia: {
    bg: "#F4ECD8",
    fg: "#3B2F1E",
    muted: "#8A7355",
    codeBg: "#EADFC5",
    border: "#DCCBA6",
    accent: "#8B6B2E",
    label: "Сепия",
  },
  dark: {
    bg: "#1B1E2E",
    fg: "#E9E4D8",
    muted: "#9A93A0",
    codeBg: "#262A3D",
    border: "#343850",
    accent: "#E8CB8B",
    label: "Қара",
  },
};

type Settings = { font: FontKey; size: number; lineHeight: number; theme: ThemeKey };

const DEFAULTS: Settings = { font: "serif", size: 18, lineHeight: 1.9, theme: "light" };
const STORAGE_KEY = "magyna:reader-settings";

export default function ReaderView({
  toc,
  content,
}: {
  toc: TocEntry[];
  content: string;
}) {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [panelOpen, setPanelOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSettings({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch {
      // localStorage unavailable — just use defaults
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings, hydrated]);

  const theme = THEMES[settings.theme];

  const wrapperStyle = {
    backgroundColor: theme.bg,
    color: theme.fg,
    padding: "1.5rem",
    borderRadius: 2,
    transition: "background-color 150ms, color 150ms",
    "--reader-fg": theme.fg,
    "--reader-muted": theme.muted,
    "--reader-code-bg": theme.codeBg,
    "--reader-border": theme.border,
    "--reader-accent": theme.accent,
    "--reader-font-size": `${settings.size}px`,
    "--reader-line-height": settings.lineHeight,
    "--reader-font-family": FONT_STACKS[settings.font],
  } as React.CSSProperties;

  return (
    <div style={wrapperStyle}>
      <div className="mb-6 flex justify-end">
        <button
          type="button"
          onClick={() => setPanelOpen((v) => !v)}
          aria-expanded={panelOpen}
          aria-label="Оқу баптаулары"
          className="rounded-sm border px-3 py-1.5 font-display text-sm"
          style={{ borderColor: theme.border }}
        >
          Aa
        </button>
      </div>

      {panelOpen && (
        <div
          className="mb-8 space-y-5 rounded-sm border p-5 text-sm"
          style={{ borderColor: theme.border }}
        >
          <div>
            <p className="mb-2 opacity-70">Қаріп</p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(FONT_STACKS) as FontKey[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSettings((s) => ({ ...s, font: key }))}
                  className="rounded-sm border px-3 py-1.5"
                  style={{
                    borderColor: settings.font === key ? theme.accent : theme.border,
                    fontFamily: FONT_STACKS[key],
                  }}
                >
                  {FONT_LABELS[key]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 opacity-70">Қаріп өлшемі · {settings.size}px</p>
            <input
              type="range"
              min={14}
              max={28}
              value={settings.size}
              onChange={(e) => setSettings((s) => ({ ...s, size: Number(e.target.value) }))}
              className="w-full"
            />
          </div>

          <div>
            <p className="mb-2 opacity-70">Жол аралығы · {settings.lineHeight.toFixed(1)}</p>
            <input
              type="range"
              min={1.4}
              max={2.2}
              step={0.1}
              value={settings.lineHeight}
              onChange={(e) => setSettings((s) => ({ ...s, lineHeight: Number(e.target.value) }))}
              className="w-full"
            />
          </div>

          <div>
            <p className="mb-2 opacity-70">Тема</p>
            <div className="flex gap-2">
              {(Object.keys(THEMES) as ThemeKey[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSettings((s) => ({ ...s, theme: key }))}
                  className="rounded-sm border px-3 py-1.5"
                  style={{
                    backgroundColor: THEMES[key].bg,
                    color: THEMES[key].fg,
                    borderColor: settings.theme === key ? THEMES[key].accent : THEMES[key].border,
                  }}
                >
                  {THEMES[key].label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <TableOfContents entries={toc} style={{ borderColor: theme.border, backgroundColor: theme.codeBg }} />
      <MarkdownContent content={content} />
    </div>
  );
}

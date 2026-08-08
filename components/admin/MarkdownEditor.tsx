"use client";

import { useRef, useState } from "react";
import MarkdownContent from "@/components/MarkdownContent";

type ToolbarAction = {
  label: string;
  ariaLabel: string;
  apply: (selected: string) => { text: string; cursorOffset?: number };
};

const actions: ToolbarAction[] = [
  { label: "B", ariaLabel: "Қалың", apply: (s) => ({ text: `**${s || "мәтін"}**` }) },
  { label: "I", ariaLabel: "Курсив", apply: (s) => ({ text: `*${s || "мәтін"}*` }) },
  { label: "H2", ariaLabel: "Тақырып", apply: (s) => ({ text: `\n## ${s || "Тақырып"}\n` }) },
  { label: "«»", ariaLabel: "Дәйексөз", apply: (s) => ({ text: `\n> ${s || "дәйексөз"}\n` }) },
  { label: "•", ariaLabel: "Тізім", apply: (s) => ({ text: `\n- ${s || "тармақ"}\n` }) },
  { label: "―", ariaLabel: "Бөлгіш", apply: () => ({ text: "\n\n---\n\n" }) },
];

export default function MarkdownEditor({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [tab, setTab] = useState<"write" | "preview">("write");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function runAction(action: ToolbarAction) {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart, selectionEnd } = el;
    const selected = value.slice(selectionStart, selectionEnd);
    const { text } = action.apply(selected);

    const next = value.slice(0, selectionStart) + text + value.slice(selectionEnd);
    onChange(next);

    requestAnimationFrame(() => {
      el.focus();
      const pos = selectionStart + text.length;
      el.setSelectionRange(pos, pos);
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between border border-b-0 border-line bg-paper-dim px-2 py-1.5">
        <div className="flex gap-1">
          {actions.map((a) => (
            <button
              key={a.label}
              type="button"
              aria-label={a.ariaLabel}
              title={a.ariaLabel}
              onClick={() => runAction(a)}
              className="rounded-sm px-2 py-1 text-sm text-ink hover:bg-white"
            >
              {a.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1 text-sm">
          <button
            type="button"
            onClick={() => setTab("write")}
            className={
              tab === "write"
                ? "rounded-sm bg-white px-3 py-1 text-ink"
                : "rounded-sm px-3 py-1 text-muted"
            }
          >
            Жазу
          </button>
          <button
            type="button"
            onClick={() => setTab("preview")}
            className={
              tab === "preview"
                ? "rounded-sm bg-white px-3 py-1 text-ink"
                : "rounded-sm px-3 py-1 text-muted"
            }
          >
            Алдын ала қарау
          </button>
        </div>
      </div>

      {tab === "write" ? (
        <textarea
          id={id}
          ref={textareaRef}
          required
          rows={16}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Тарау мәтінін осында жазыңыз... Markdown қолдауы бар: **қалың**, *курсив*, ## тақырып, > дәйексөз"
          className="w-full border border-line bg-white px-3 py-2 font-body outline-none focus:border-gold-500"
        />
      ) : (
        <div className="max-h-[28rem] overflow-y-auto border border-line bg-white px-4 py-3">
          {value.trim() ? (
            <MarkdownContent content={value} />
          ) : (
            <p className="text-sm text-muted">Алдын ала қарау үшін мәтін жазыңыз.</p>
          )}
        </div>
      )}
    </div>
  );
}

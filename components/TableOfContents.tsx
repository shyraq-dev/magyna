import type { TocEntry } from "@/lib/markdown/toc";

export default function TableOfContents({
  entries,
  style,
}: {
  entries: TocEntry[];
  /** Lets ReaderView pass theme-matched background/border colors; text
   *  color is left to inherit from the reading theme's wrapper. */
  style?: React.CSSProperties;
}) {
  if (entries.length < 2) return null;

  return (
    <nav
      aria-label="Тарау мазмұны"
      className="mb-10 border px-5 py-4"
      style={{ borderColor: "#E4DCC9", backgroundColor: "#F3EEE1", ...style }}
    >
      <p className="font-display text-sm uppercase tracking-[0.15em] opacity-70">
        Мазмұны
      </p>
      <ul className="mt-3 space-y-1.5 text-sm">
        {entries.map((entry) => (
          <li key={entry.id} style={{ paddingLeft: (entry.level - 2) * 16 }}>
            <a href={`#${entry.id}`} className="opacity-90 hover:opacity-100 hover:text-gold-600">
              {entry.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

import GithubSlugger from "github-slugger";

export type TocEntry = {
  level: number; // 2 or 3 (## / ###) — chapter titles are implicitly H1
  text: string;
  id: string;
};

/**
 * Scans raw Markdown for ## and ### headings and returns them with the
 * same slug ids rehype-slug will assign when rendering, so in-page
 * anchor links (#slug) line up with the rendered content.
 */
export function extractToc(markdown: string): TocEntry[] {
  const slugger = new GithubSlugger();
  const entries: TocEntry[] = [];

  for (const rawLine of markdown.split("\n")) {
    const match = /^(#{2,3})\s+(.+?)\s*#*$/.exec(rawLine.trim());
    if (!match) continue;

    const level = match[1].length;
    const text = match[2].trim();
    if (!text) continue;

    entries.push({ level, text, id: slugger.slug(text) });
  }

  return entries;
}

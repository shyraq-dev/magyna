export function parseParagraphs(content: string): string[] {
  if (!content.trim()) return [];

  if (content.includes('<p')) {
    const matches = [...content.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => m[1].trim());
    if (matches.length > 0) return matches.filter((p) => p.length > 0);
  }

  // Ескі жазбалар үшін: жай мәтінді бос жолдар бойынша бөлу
  return content
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function countWords(text: string): number {
  const stripped = text.replace(/<[^>]+>/g, ' ');
  const words = stripped.trim().split(/\s+/).filter(Boolean);
  return words.length;
}

const WORDS_PER_MINUTE = 200;

export function estimateReadingTime(wordCount: number): string {
  const minutes = Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));
  if (minutes < 60) return `${minutes} мин оқу`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest > 0 ? `${hours} сағ ${rest} мин оқу` : `${hours} сағ оқу`;
}

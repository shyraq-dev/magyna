function stripHandle(value: string) {
  return value.trim().replace(/^@/, "").replace(/^https?:\/\/[^/]+\//, "");
}

export function instagramUrl(value: string) {
  if (/^https?:\/\//i.test(value)) return value;
  return `https://instagram.com/${stripHandle(value)}`;
}

export function tiktokUrl(value: string) {
  if (/^https?:\/\//i.test(value)) return value;
  return `https://tiktok.com/@${stripHandle(value)}`;
}

export function websiteUrl(value: string) {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

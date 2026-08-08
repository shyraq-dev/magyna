"use client";

export default function DraftStatus({
  savedAt,
  restoredAt,
}: {
  savedAt: number | null;
  restoredAt: number | null;
}) {
  const timestamp = savedAt ?? restoredAt;
  if (!timestamp) return null;

  const time = new Date(timestamp).toLocaleTimeString("kk-KZ", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <span className="text-xs text-muted">
      {savedAt ? `Жоба сақталды · ${time}` : `Жоба · ${time}`}
    </span>
  );
}

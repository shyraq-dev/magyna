import Link from "next/link";
import Image from "next/image";

export default function DoramaCard({
  slug,
  title,
  genre,
  coverUrl,
}: {
  slug: string;
  title: string;
  genre?: string | null;
  coverUrl?: string | null;
}) {
  return (
    <Link href={`/dorama/${slug}`} className="group block">
      <div className="card-lift relative aspect-[2/3] overflow-hidden rounded-sm bg-ink">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 45vw, 200px"
          />
        ) : (
          <div className="relative flex h-full items-center justify-center bg-gradient-to-br from-ink to-ink-soft p-4 text-center">
            <span className="absolute left-0 top-0 h-full w-1 bg-gold-500/40" aria-hidden="true" />
            <span className="font-display leading-snug text-paper">{title}</span>
          </div>
        )}
        <div className="page-fold pointer-events-none absolute bottom-0 right-0 h-5 w-5 opacity-70" />
      </div>
      <h3 className="mt-3 font-display text-base leading-snug transition-colors group-hover:text-gold-600">
        {title}
      </h3>
      {genre && <p className="mt-1 text-sm text-muted">{genre}</p>}
    </Link>
  );
}

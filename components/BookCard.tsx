import Link from "next/link";
import Image from "next/image";

type BookCardProps = {
  slug: string;
  title: string;
  description?: string | null;
  coverUrl?: string | null;
  progress?: number; // 0..1, only for books on the user's shelf
};

export default function BookCard({
  slug,
  title,
  description,
  coverUrl,
  progress,
}: BookCardProps) {
  return (
    <Link href={`/kitaptar/${slug}`} className="group block">
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
        {/* A page-corner fold on every cover — a small, literal detail
           that says "book" even before the title is read. */}
        <div className="page-fold pointer-events-none absolute bottom-0 right-0 h-5 w-5 opacity-70" />
        {typeof progress === "number" && (
          <div
            className="bookmark-ribbon absolute right-3 top-0 h-10 w-6 bg-nib-gradient"
            title={`Оқылды: ${Math.round(progress * 100)}%`}
          />
        )}
      </div>
      <h3 className="mt-3 font-display text-base leading-snug transition-colors group-hover:text-gold-600">
        {title}
      </h3>
      {description && (
        <p className="mt-1 line-clamp-2 text-sm text-muted">{description}</p>
      )}
    </Link>
  );
}

import Link from 'next/link';
import type { Book } from '@/types/database';

export default function BookCard({ book }: { book: Book }) {
  return (
    <Link
      href={`/books/${book.id}`}
      className="focus-ring group flex flex-col overflow-hidden rounded-lg border border-night-700/60 bg-night-900 transition-colors hover:border-ember-500/60"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-night-800">
        {book.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={book.cover_url}
            alt={book.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-3 text-center font-display text-lg text-parchment-200/50">
            {book.title}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 font-display text-base leading-snug text-parchment-100">
          {book.title}
        </h3>
        {book.author?.display_name && (
          <p className="text-xs text-parchment-200/60">{book.author.display_name}</p>
        )}
        <div className="mt-auto flex items-center gap-3 pt-2 text-xs text-parchment-200/50">
          <span>{book.views_count} оқылым</span>
          <span>♥ {book.likes_count}</span>
        </div>
      </div>
    </Link>
  );
}

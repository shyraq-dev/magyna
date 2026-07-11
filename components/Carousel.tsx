import BookCard from './BookCard';
import type { Book } from '@/types/database';

export default function Carousel({ title, books }: { title: string; books: Book[] }) {
  if (books.length === 0) return null;

  return (
    <section className="mb-12">
      <h2 className="mb-4 font-display text-2xl text-parchment-100">{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
        {books.map((b) => (
          <div key={b.id} className="w-36 shrink-0 sm:w-44">
            <BookCard book={b} />
          </div>
        ))}
      </div>
    </section>
  );
}

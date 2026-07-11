'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Book = { id: string; title: string; status: string; is_featured: boolean; author: { username: string } | null };

export default function AdminBooks({ books: initial }: { books: Book[] }) {
  const [books, setBooks] = useState(initial);
  const supabase = createClient();

  async function removeBook(id: string) {
    if (!confirm('Бұл кітапты өшіру керек пе?')) return;
    await supabase.from('books').delete().eq('id', id);
    setBooks((b) => b.filter((x) => x.id !== id));
  }

  async function toggleFeatured(id: string, current: boolean) {
    await supabase.from('books').update({ is_featured: !current }).eq('id', id);
    setBooks((b) => b.map((x) => (x.id === id ? { ...x, is_featured: !current } : x)));
  }

  return (
    <section>
      <h2 className="mb-4 font-display text-xl text-parchment-100">Контент модерациясы және куратор</h2>
      <div className="overflow-hidden rounded-lg border border-night-700">
        <table className="w-full text-sm">
          <thead className="bg-night-900 text-left text-xs text-parchment-200/50">
            <tr>
              <th className="px-4 py-2">Атауы</th>
              <th className="px-4 py-2">Автор</th>
              <th className="px-4 py-2">Күй</th>
              <th className="px-4 py-2">Бүгінгі таңдау</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {books.map((b) => (
              <tr key={b.id} className="border-t border-night-800">
                <td className="px-4 py-2 text-parchment-100">{b.title}</td>
                <td className="px-4 py-2 text-parchment-200/60">{b.author?.username}</td>
                <td className="px-4 py-2 text-parchment-200/60">{b.status}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => toggleFeatured(b.id, b.is_featured)}
                    className={`focus-ring rounded-full border px-2 py-1 text-xs ${
                      b.is_featured
                        ? 'border-ember-500 bg-ember-500/20 text-ember-400'
                        : 'border-night-600 text-parchment-200/50'
                    }`}
                  >
                    {b.is_featured ? '★ Таңдаулы' : '☆ Қосу'}
                  </button>
                </td>
                <td className="px-4 py-2 text-right">
                  <button
                    onClick={() => removeBook(b.id)}
                    className="focus-ring rounded-full border border-red-500/40 px-3 py-1 text-xs text-red-400 hover:bg-red-500/10"
                  >
                    Өшіру
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

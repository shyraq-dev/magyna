'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Genre = { id: string; name: string; slug: string };

export default function AdminGenres({ genres: initial }: { genres: Genre[] }) {
  const [genres, setGenres] = useState(initial);
  const [name, setName] = useState('');
  const supabase = createClient();

  async function addGenre(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const slug = name.trim().toLowerCase().replace(/\s+/g, '-');
    const { data } = await supabase.from('genres').insert({ name: name.trim(), slug }).select().single();
    if (data) setGenres((g) => [...g, data]);
    setName('');
  }

  async function removeGenre(id: string) {
    await supabase.from('genres').delete().eq('id', id);
    setGenres((g) => g.filter((x) => x.id !== id));
  }

  return (
    <section>
      <h2 className="mb-4 font-display text-xl text-parchment-100">Жанрлар мен санаттар</h2>
      <form onSubmit={addGenre} className="mb-4 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Жаңа жанр атауы"
          className="focus-ring rounded-md border border-night-600 bg-night-900 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="focus-ring rounded-md bg-ember-500 px-4 py-2 text-sm font-medium text-night-950 hover:bg-ember-400"
        >
          Қосу
        </button>
      </form>
      <div className="flex flex-wrap gap-2">
        {genres.map((g) => (
          <span
            key={g.id}
            className="flex items-center gap-2 rounded-full border border-night-600 px-3 py-1 text-xs text-parchment-200/80"
          >
            {g.name}
            <button onClick={() => removeGenre(g.id)} className="focus-ring text-red-400 hover:text-red-300">
              ×
            </button>
          </span>
        ))}
      </div>
    </section>
  );
}

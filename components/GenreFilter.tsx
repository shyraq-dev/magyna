'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function GenreFilter({ genres }: { genres: { id: string; name: string; slug: string }[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get('genre');

  function select(slug: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) params.set('genre', slug);
    else params.delete('genre');
    params.delete('q');
    router.push(`/?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => select(null)}
        className={`focus-ring rounded-full border px-3 py-1.5 text-sm ${
          !active ? 'border-ember-500 bg-ember-500/20 text-ember-400' : 'border-night-600 text-parchment-200/70'
        }`}
      >
        Барлығы
      </button>
      {genres.map((g) => (
        <button
          key={g.id}
          onClick={() => select(g.slug)}
          className={`focus-ring rounded-full border px-3 py-1.5 text-sm ${
            active === g.slug
              ? 'border-ember-500 bg-ember-500/20 text-ember-400'
              : 'border-night-600 text-parchment-200/70'
          }`}
        >
          {g.name}
        </button>
      ))}
    </div>
  );
}

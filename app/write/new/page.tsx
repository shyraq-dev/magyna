'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type Genre = { id: string; name: string };

export default function NewBookPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [writingStatus, setWritingStatus] = useState<'in_progress' | 'completed'>('in_progress');
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    supabase
      .from('genres')
      .select('id, name')
      .order('name')
      .then(({ data }) => setGenres(data ?? []));

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push('/login');
        return;
      }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (profile?.role !== 'admin') router.push('/');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  function toggleGenre(id: string) {
    setSelectedGenres((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') {
      router.push('/');
      return;
    }

    let coverUrl: string | null = null;
    if (coverFile) {
      const path = `${user.id}/${Date.now()}-${coverFile.name}`;
      const { error: uploadError } = await supabase.storage.from('covers').upload(path, coverFile);
      if (!uploadError) {
        coverUrl = supabase.storage.from('covers').getPublicUrl(path).data.publicUrl;
      }
    }

    const { data: book, error: insertError } = await supabase
      .from('books')
      .insert({
        title: title.slice(0, 100),
        description: description.slice(0, 1000),
        writing_status: writingStatus,
        author_id: user.id,
        cover_url: coverUrl,
        status: 'draft',
      })
      .select()
      .single();

    if (insertError || !book) {
      setLoading(false);
      setError('Кітап жасау кезінде қате шықты.');
      return;
    }

    if (selectedGenres.length > 0) {
      await supabase
        .from('book_genres')
        .insert(selectedGenres.map((genre_id) => ({ book_id: book.id, genre_id })));
    }

    const tags = tagsInput
      .split(/[,#\s]+/)
      .map((t) => t.trim())
      .filter(Boolean);
    if (tags.length > 0) {
      await supabase.from('book_tags').insert(tags.map((tag) => ({ book_id: book.id, tag })));
    }

    router.push(`/write/${book.id}`);
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="mb-6 font-display text-3xl text-parchment-100">Жаңа кітап</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm text-parchment-200/70">Атауы (макс 100 таңба)</label>
          <input
            required
            maxLength={100}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="focus-ring w-full rounded-md border border-night-600 bg-night-900 px-3 py-2 text-sm"
          />
          <p className="mt-1 text-right text-xs text-parchment-200/40">{title.length}/100</p>
        </div>

        <div>
          <label className="mb-1 block text-sm text-parchment-200/70">Аннотация (макс 1000 таңба)</label>
          <textarea
            rows={4}
            maxLength={1000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="focus-ring w-full rounded-md border border-night-600 bg-night-900 px-3 py-2 text-sm"
          />
          <p className="mt-1 text-right text-xs text-parchment-200/40">{description.length}/1000</p>
        </div>

        <div>
          <label className="mb-1 block text-sm text-parchment-200/70">Мұқаба суреті (макс 5 МБ)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              if (file && file.size > 5 * 1024 * 1024) {
                setError('Сурет көлемі 5 МБ-дан аспауы керек.');
                return;
              }
              setError(null);
              setCoverFile(file);
            }}
            className="focus-ring block w-full text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-parchment-200/70">Тегтер (үтірмен бөліңіз)</label>
          <input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="фэнтези, махаббат, психология"
            className="focus-ring w-full rounded-md border border-night-600 bg-night-900 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-parchment-200/70">Жанрлар</label>
          <div className="flex flex-wrap gap-2">
            {genres.map((g) => (
              <button
                type="button"
                key={g.id}
                onClick={() => toggleGenre(g.id)}
                className={`focus-ring rounded-full border px-3 py-1 text-xs ${
                  selectedGenres.includes(g.id)
                    ? 'border-ember-500 bg-ember-500/20 text-ember-400'
                    : 'border-night-600 text-parchment-200/70'
                }`}
              >
                {g.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-parchment-200/70">Статус</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setWritingStatus('in_progress')}
              className={`focus-ring rounded-full border px-4 py-1.5 text-sm ${
                writingStatus === 'in_progress'
                  ? 'border-ember-500 bg-ember-500/20 text-ember-400'
                  : 'border-night-600 text-parchment-200/70'
              }`}
            >
              Жазылуда
            </button>
            <button
              type="button"
              onClick={() => setWritingStatus('completed')}
              className={`focus-ring rounded-full border px-4 py-1.5 text-sm ${
                writingStatus === 'completed'
                  ? 'border-ember-500 bg-ember-500/20 text-ember-400'
                  : 'border-night-600 text-parchment-200/70'
              }`}
            >
              Аяқталды
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="focus-ring mt-2 rounded-md bg-ember-500 px-4 py-2 text-sm font-medium text-night-950 hover:bg-ember-400 disabled:opacity-60"
        >
          {loading ? 'Жасалуда...' : 'Кітапты жасау'}
        </button>
      </form>
    </div>
  );
}

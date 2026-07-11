'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import AvatarCropper from '@/components/AvatarCropper';

export default function EditProfilePage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [instagram, setInstagram] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [website, setWebsite] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push('/login');
        return;
      }
      setUserId(user.id);
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profile) {
        setDisplayName(profile.display_name ?? '');
        setBio(profile.bio ?? '');
        setAvatarUrl(profile.avatar_url);
        setInstagram(profile.socials?.instagram ?? '');
        setTiktok(profile.socials?.tiktok ?? '');
        setWebsite(profile.socials?.website ?? '');
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Сурет көлемі 5 МБ-дан аспауы керек.');
      return;
    }
    setError(null);
    setPendingFile(file);
  }

  async function onCropped(blob: Blob) {
    if (!userId) return;
    setPendingFile(null);
    const path = `${userId}/avatar-${Date.now()}.png`;
    const { error: uploadError } = await supabase.storage.from('avatars').upload(path, blob, {
      contentType: 'image/png',
    });
    if (!uploadError) {
      const url = supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl;
      setAvatarUrl(url);
    } else {
      setError('Аватар жүктеу кезінде қате шықты. "avatars" bucket жасалғанын тексеріңіз.');
    }
  }

  async function save() {
    if (!userId) return;
    setSaving(true);
    setError(null);
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        display_name: displayName || null,
        bio: bio.slice(0, 250) || null,
        avatar_url: avatarUrl,
        socials: { instagram, tiktok, website },
      })
      .eq('id', userId);
    setSaving(false);
    if (updateError) {
      setError('Сақтау кезінде қате шықты.');
      return;
    }
    router.push(`/profile/${userId}`);
    router.refresh();
  }

  if (!userId) return null;

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="mb-6 font-display text-3xl text-parchment-100">Профильді баптау</h1>

      <div className="mb-6">
        <label className="mb-2 block text-sm text-parchment-200/70">Аватар</label>
        {pendingFile ? (
          <AvatarCropper file={pendingFile} onCropped={onCropped} onCancel={() => setPendingFile(null)} />
        ) : (
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-night-800">
              {avatarUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <label className="focus-ring cursor-pointer rounded-full border border-night-600 px-4 py-1.5 text-sm hover:border-ember-500">
              Сурет таңдау
              <input type="file" accept="image/*" onChange={onFileSelect} className="hidden" />
            </label>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm text-parchment-200/70">Көрсетілетін есім</label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="focus-ring w-full rounded-md border border-night-600 bg-night-900 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-parchment-200/70">Өзі туралы (макс 250 таңба)</label>
          <textarea
            rows={3}
            maxLength={250}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="focus-ring w-full rounded-md border border-night-600 bg-night-900 px-3 py-2 text-sm"
          />
          <p className="mt-1 text-right text-xs text-parchment-200/40">{bio.length}/250</p>
        </div>

        <div>
          <label className="mb-1 block text-sm text-parchment-200/70">Instagram</label>
          <input
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="@никнейм"
            className="focus-ring w-full rounded-md border border-night-600 bg-night-900 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-parchment-200/70">TikTok</label>
          <input
            value={tiktok}
            onChange={(e) => setTiktok(e.target.value)}
            placeholder="@никнейм"
            className="focus-ring w-full rounded-md border border-night-600 bg-night-900 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-parchment-200/70">Веб-сайт</label>
          <input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://..."
            className="focus-ring w-full rounded-md border border-night-600 bg-night-900 px-3 py-2 text-sm"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          onClick={save}
          disabled={saving}
          className="focus-ring mt-2 rounded-md bg-ember-500 px-4 py-2 text-sm font-medium text-night-950 hover:bg-ember-400 disabled:opacity-60"
        >
          {saving ? 'Сақталуда...' : 'Сақтау'}
        </button>
      </div>
    </div>
  );
}

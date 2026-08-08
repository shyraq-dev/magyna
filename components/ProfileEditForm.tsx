"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AvatarCropUpload from "@/components/AvatarCropUpload";

type Profile = {
  username: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  website_url: string | null;
  telegram_link: string | null;
};

export default function ProfileEditForm({
  userId,
  profile,
}: {
  userId: string;
  profile: Profile;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [username, setUsername] = useState(profile.username);
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [instagram, setInstagram] = useState(profile.instagram_url ?? "");
  const [tiktok, setTiktok] = useState(profile.tiktok_url ?? "");
  const [website, setWebsite] = useState(profile.website_url ?? "");
  const [telegramLink, setTelegramLink] = useState(profile.telegram_link ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const { error } = await supabase
      .from("profiles")
      .update({
        username: username.trim(),
        full_name: fullName.trim() || null,
        bio: bio.trim() || null,
        instagram_url: instagram.trim() || null,
        tiktok_url: tiktok.trim() || null,
        website_url: website.trim() || null,
        telegram_link: telegramLink.trim() || null,
      })
      .eq("id", userId);

    setSaving(false);
    if (error) {
      setError(
        error.message.includes("duplicate") || error.message.includes("unique")
          ? "Бұл пайдаланушы аты бос емес. Басқасын таңдаңыз."
          : `Сақтау сәтсіз аяқталды: ${error.message}`
      );
      return;
    }

    router.push("/beyin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <AvatarCropUpload
        userId={userId}
        currentAvatarUrl={avatarUrl}
        onUploaded={async (url) => {
          setAvatarUrl(url);
          await supabase.from("profiles").update({ avatar_url: url }).eq("id", userId);
        }}
      />

      <div>
        <label htmlFor="username" className="block text-sm">
          Пайдаланушы аты
        </label>
        <input
          id="username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mt-1 input"
        />
      </div>

      <div>
        <label htmlFor="full_name" className="block text-sm">
          Көрсетілетін есім
        </label>
        <input
          id="full_name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="mt-1 input"
        />
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm">
          Өзі туралы
        </label>
        <textarea
          id="bio"
          rows={3}
          maxLength={250}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="mt-1 input"
        />
        <p className="mt-1 text-right text-xs text-muted">{bio.length}/250</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="instagram" className="block text-sm">
            Instagram
          </label>
          <input
            id="instagram"
            placeholder="@username"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            className="mt-1 input"
          />
        </div>
        <div>
          <label htmlFor="tiktok" className="block text-sm">
            TikTok
          </label>
          <input
            id="tiktok"
            placeholder="@username"
            value={tiktok}
            onChange={(e) => setTiktok(e.target.value)}
            className="mt-1 input"
          />
        </div>
        <div>
          <label htmlFor="telegram_link" className="block text-sm">
            Telegram (арна/топ/бот)
          </label>
          <input
            id="telegram_link"
            placeholder="https://t.me/..."
            value={telegramLink}
            onChange={(e) => setTelegramLink(e.target.value)}
            className="mt-1 input"
          />
        </div>
        <div>
          <label htmlFor="website" className="block text-sm">
            Веб-сайт
          </label>
          <input
            id="website"
            placeholder="https://..."
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="mt-1 input"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="btn-primary px-6 py-3 disabled:opacity-60"
      >
        {saving ? "Сақталуда..." : "Сақтау"}
      </button>
    </form>
  );
}

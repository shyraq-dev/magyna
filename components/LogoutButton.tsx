"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function logout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      className="rounded-sm border border-line px-5 py-2 text-sm text-muted transition hover:border-red-400 hover:text-red-700"
    >
      Шығу
    </button>
  );
}

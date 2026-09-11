import { createBrowserClient } from "@supabase/ssr";

// Deliberately untyped: see lib/supabase/README-types.md for why this
// project doesn't pass a Database generic to the Supabase clients.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

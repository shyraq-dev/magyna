import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Next.js 15+/16-да cookies() асинхронды болды, сондықтан бұл функция
// да async болуы керек — шақырған жерде `await createClient()` қолданыңыз.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Server Component-тен шақырылса — proxy.ts сессияны рефреш етеді
          }
        },
      },
    }
  );
}

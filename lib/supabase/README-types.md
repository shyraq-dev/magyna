# Неге `Database` generic қолданылмайды

`types.ts` файлында дерекқор схемасының қолмен жазылған сипаттамасы бар,
бірақ оны `createBrowserClient<Database>(...)` / `createServerClient<Database>(...)`
түрінде клиенттерге бермейміз.

Себебі: осы жобада `Database` generic-імен бірге қолданылғанда
`@supabase/postgrest-js`-тің select-жолын типке айналдыратын
парсері кейбір сұрауларда нәтижені `never`-ге дейін құлатып жіберді
(`Property 'id' does not exist on type 'never'`), тіпті `Relationships`/
`Views`/`Functions`/`Enums` өрістерінің бәрі дұрыс толтырылған кезде де.
Бұл — `postgrest-js` нұсқасына тәуелді, көбіне белгілі мәселе.

Generic-ті алып тастау мәселені толығымен шешеді: сұрау нәтижелері
бос (loosely-typed) болады, бірақ билд әрқашан өтеді.

Дұрысырақ ұзақ мерзімді шешім — Supabase CLI арқылы схеманы
автоматты генерациялау:

```bash
npx supabase gen types typescript --project-id <id> > lib/supabase/types.ts
```

Осылай алынған файл жобаның нақты орнатылған `postgrest-js`
нұсқасымен әрдайым үйлесімді болады. Оны қолдана бастасаңыз,
`client.ts`/`server.ts`/`admin.ts`-ке generic-ті қайта қосар алдында
`npm run build`-ды жергілікті жерде міндетті түрде тексеріңіз.

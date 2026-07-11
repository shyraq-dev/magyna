-- Migration 003: Толық детальды ТТ бойынша кеңейту
-- (Профиль, Оқырман, Жазушы, Админ/Модерация, Бейфункционалдық талаптар)

-- ============================================================
-- 1. Профиль кеңейтулері
-- ============================================================
alter table public.profiles add column if not exists banned_until timestamptz;
alter table public.profiles add column if not exists banned_reason text;

-- ============================================================
-- 2. Кітап кеңейтулері (мета-деректер, куратор, статус)
-- ============================================================
alter table public.books add column if not exists writing_status text not null default 'in_progress'
  check (writing_status in ('in_progress', 'completed'));
alter table public.books add column if not exists is_featured boolean not null default false;
alter table public.books add column if not exists word_count integer not null default 0;

create index if not exists idx_books_featured on public.books(is_featured) where is_featured = true;

-- ============================================================
-- 3. Тарау кеңейтулері (жоспарлы жариялау, жеке қаралым, сөз саны)
-- ============================================================
alter table public.chapters add column if not exists scheduled_at timestamptz;
alter table public.chapters add column if not exists views_count integer not null default 0;
alter table public.chapters add column if not exists likes_count integer not null default 0;
alter table public.chapters add column if not exists word_count integer not null default 0;

-- Тарау жеке лайктары (кім басқанын бақылау үшін)
create table if not exists public.chapter_likes (
  user_id uuid references public.profiles(id) on delete cascade,
  chapter_id uuid references public.chapters(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, chapter_id)
);

-- Кітап оқылымдарының уақыт белгісі (белсенділік графигі үшін)
create table if not exists public.book_view_events (
  id bigint generated always as identity primary key,
  book_id uuid not null references public.books(id) on delete cascade,
  viewed_at timestamptz not null default now()
);
create index if not exists idx_book_view_events_book on public.book_view_events(book_id, viewed_at);

-- ============================================================
-- 4. Абзацқа пікір (paragraph-level comments)
-- ============================================================
alter table public.comments add column if not exists chapter_id uuid references public.chapters(id) on delete cascade;
alter table public.comments add column if not exists paragraph_index integer;

-- ============================================================
-- 5. Дәйексөздер (Quote highlight & share)
-- ============================================================
create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  text_snippet text not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 6. Шағымдану жүйесі (Report system)
-- ============================================================
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  content_type text not null check (content_type in ('book', 'comment', 'chapter')),
  content_id uuid not null,
  reason text not null check (reason in ('plagiarism', 'profanity', 'spam', 'other')),
  details text,
  status text not null default 'pending' check (status in ('pending', 'resolved', 'dismissed')),
  created_at timestamptz not null default now()
);

-- ============================================================
-- 7. Қолдау қызметі (Support tickets)
-- ============================================================
create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  subject text not null,
  message text not null,
  status text not null default 'open' check (status in ('open', 'answered', 'closed')),
  admin_reply text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- RLS
-- ============================================================
alter table public.chapter_likes enable row level security;
alter table public.book_view_events enable row level security;
alter table public.quotes enable row level security;
alter table public.reports enable row level security;
alter table public.support_tickets enable row level security;

create policy "Users manage own chapter likes" on public.chapter_likes for all using (auth.uid() = user_id);
create policy "Chapter likes are public" on public.chapter_likes for select using (true);

create policy "Anyone can log a view event" on public.book_view_events for insert with check (true);
create policy "Admin reads view events" on public.book_view_events for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "Users manage own quotes" on public.quotes for all using (auth.uid() = user_id);

create policy "Users create reports" on public.reports for insert with check (auth.uid() = reporter_id);
create policy "Users see own reports" on public.reports for select using (auth.uid() = reporter_id);
create policy "Admin manages all reports" on public.reports for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "Users manage own tickets" on public.support_tickets for select using (auth.uid() = user_id);
create policy "Users create tickets" on public.support_tickets for insert with check (auth.uid() = user_id);
create policy "Admin manages all tickets" on public.support_tickets for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ============================================================
-- 8. Жоспарлы жариялау (pg_cron арқылы автоматты publish)
-- ============================================================
create extension if not exists pg_cron;

create function public.publish_scheduled_chapters() returns void as $$
begin
  update public.chapters
  set status = 'published'
  where status = 'draft'
    and scheduled_at is not null
    and scheduled_at <= now();
end;
$$ language plpgsql security definer set search_path = public;

select cron.schedule(
  'publish-scheduled-chapters',
  '* * * * *', -- әр минут сайын тексереді
  $$select public.publish_scheduled_chapters();$$
);

-- ============================================================
-- 9. Бұғаттау мерзімі аяқталғанда автоматты босату
-- ============================================================
create function public.unban_expired_users() returns void as $$
begin
  update public.profiles
  set is_banned = false, banned_until = null, banned_reason = null
  where is_banned = true
    and banned_until is not null
    and banned_until <= now();
end;
$$ language plpgsql security definer set search_path = public;

select cron.schedule(
  'unban-expired-users',
  '*/5 * * * *',
  $$select public.unban_expired_users();$$
);

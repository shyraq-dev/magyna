-- Maǵyna: schema.sql
-- Run this in the Supabase SQL editor (or via `supabase db push`).

-- 1. Profiles ---------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  full_name text,
  telegram_id bigint unique,
  avatar_url text,
  bio text check (char_length(bio) <= 250),
  instagram_url text,
  tiktok_url text,
  website_url text,
  telegram_link text,
  is_admin boolean not null default false,
  is_writer boolean not null default false,
  created_at timestamptz not null default now()
);

-- Adds the columns above to a profiles table created by an earlier
-- version of this schema (safe to re-run; no-ops if already present).
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists instagram_url text;
alter table public.profiles add column if not exists tiktok_url text;
alter table public.profiles add column if not exists website_url text;
alter table public.profiles add column if not exists telegram_link text;
alter table public.profiles add column if not exists is_writer boolean not null default false;
alter table public.profiles drop constraint if exists profiles_bio_check;
alter table public.profiles add constraint profiles_bio_check check (char_length(bio) <= 250);

-- The founder/admin account is always implicitly a writer too — backfill
-- it once here (the trigger below keeps it in sync going forward).
update public.profiles set is_writer = true where is_admin = true;

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, telegram_id, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'full_name',
    nullif(new.raw_user_meta_data ->> 'telegram_id', '')::bigint,
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Books & chapters ---------------------------------------------------
create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  cover_url text,
  author_id uuid not null references public.profiles(id),
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now()
);

create table if not exists public.chapters (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  chapter_number int not null,
  title text not null,
  content text not null,
  created_at timestamptz not null default now(),
  unique (book_id, chapter_number)
);

-- 3. Personal shelf (кітап сөресі) --------------------------------------
create table if not exists public.shelf (
  user_id uuid not null references public.profiles(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (user_id, book_id)
);

-- 4. Reading progress -----------------------------------------------
create table if not exists public.reading_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  position numeric not null default 0, -- 0..1 scroll fraction within chapter
  updated_at timestamptz not null default now(),
  finished_at timestamptz, -- set when the reader reaches the end of a book's last chapter
  primary key (user_id, book_id)
);

alter table public.reading_progress add column if not exists finished_at timestamptz;

-- 5. Comments / reactions ----------------------------------------------
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 2000),
  created_at timestamptz not null default now()
);

-- 6. Push subscriptions (Web Push) --------------------------------------
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text unique not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

-- 7. Reports (content moderation queue) ----------------------------------
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  target_type text not null default 'comment' check (target_type in ('comment')),
  target_id uuid not null,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null,
  status text not null default 'pending' check (status in ('pending', 'resolved', 'dismissed')),
  created_at timestamptz not null default now()
);

-- 7.5. Notifications (in-app bell) ------------------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  message text not null,
  url text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_unread_idx
  on public.notifications (user_id, is_read, created_at desc);

-- 8. Dorama Hub --------------------------------------------------------
-- Superseded by the thread/reply forum below (the flat comment list from
-- an earlier version of this schema wasn't what the spec described).
drop table if exists public.dorama_comments cascade;

create table if not exists public.doramas (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  synopsis text,
  genre text,
  cover_url text,
  trailer_url text,
  external_url text not null, -- where the "Көру" button sends readers
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.dorama_threads (
  id uuid primary key default gen_random_uuid(),
  dorama_id uuid not null references public.doramas(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  created_at timestamptz not null default now()
);

create table if not exists public.dorama_thread_replies (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.dorama_threads(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 2000),
  created_at timestamptz not null default now()
);

-- Chapter views/likes — feeds the "Көп оқылатын туынды" and "Үздік автор"
-- badges below, which previously had no data source to auto-award from.
alter table public.chapters add column if not exists views integer not null default 0;

create table if not exists public.chapter_likes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, chapter_id)
);

-- Atomic increment so concurrent page loads can't race and undercount —
-- called via the service-role client from the chapter reading page.
create or replace function public.increment_chapter_views(p_chapter_id uuid)
returns void as $$
begin
  update public.chapters set views = views + 1 where id = p_chapter_id;
end;
$$ language plpgsql security definer;

-- Book ratings (1-5 stars) — feeds the "Оқырман таңдауы" badge below.
create table if not exists public.book_ratings (
  user_id uuid not null references public.profiles(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, book_id)
);

-- 8.5. Settings support tables ------------------------------------------
create table if not exists public.notification_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  new_chapter boolean not null default true,
  comments boolean not null default true,
  dorama boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  subject text not null check (char_length(subject) between 1 and 200),
  message text not null check (char_length(message) between 1 and 4000),
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz not null default now()
);

-- 9. Badges ----------------------------------------------------------------
-- A small static catalog plus a junction table. Awarding happens via
-- triggers below (not the app), so it stays correct even if writes
-- happen from multiple surfaces. All catalog entries below now have a
-- real auto-award trigger.
create table if not exists public.badges (
  key text primary key,
  label text not null,
  description text,
  audience text not null check (audience in ('reader', 'writer', 'founder'))
);

insert into public.badges (key, label, description, audience) values
  ('active_commenter', 'Белсенді пікір қалдырушы', '10-нан астам пікір қалдырды', 'reader'),
  ('marathoner', 'Марафоншы', 'Соңғы 30 күнде 5 кітап оқып бітірді', 'reader'),
  ('discerning_reader', 'Талғампаз оқырман', 'Сөресіне 10-нан астам кітап жинады', 'reader'),
  ('bestseller', 'Бестселлер', 'Кітабы 10-нан астам оқырманның сөресіне қосылды', 'writer'),
  ('top_author', 'Үздік автор', 'Барлық туындылары жиынтығында 50-ден астам лайк жинады', 'writer'),
  ('most_read', 'Көп оқылатын туынды', 'Бір тарауы 500-ден астам рет оқылды', 'writer'),
  ('readers_choice', 'Оқырман таңдауы', 'Кітабы 10+ баға жинап, орташа 4.5+ рейтингке жетті', 'writer'),
  ('founder', 'Негізін қалаушы', 'Қолданбаның бас авторы', 'founder')
on conflict (key) do update set
  label = excluded.label,
  description = excluded.description,
  audience = excluded.audience;

create table if not exists public.user_badges (
  user_id uuid not null references public.profiles(id) on delete cascade,
  badge_key text not null references public.badges(key) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (user_id, badge_key)
);

-- Award functions — each runs after the action that could newly qualify
-- someone, and is a no-op once the badge is already held (on conflict
-- do nothing on the primary key).
create or replace function public.award_active_commenter()
returns trigger as $$
declare
  cnt int;
begin
  select count(*) into cnt from public.comments where user_id = new.user_id;
  if cnt >= 10 then
    insert into public.user_badges (user_id, badge_key)
    values (new.user_id, 'active_commenter')
    on conflict do nothing;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_award_active_commenter on public.comments;
create trigger trg_award_active_commenter
  after insert on public.comments
  for each row execute function public.award_active_commenter();

create or replace function public.award_shelf_badges()
returns trigger as $$
declare
  reader_cnt int;
  book_author_id uuid;
  writer_cnt int;
begin
  select count(*) into reader_cnt from public.shelf where user_id = new.user_id;
  if reader_cnt >= 10 then
    insert into public.user_badges (user_id, badge_key)
    values (new.user_id, 'discerning_reader')
    on conflict do nothing;
  end if;

  select b.author_id into book_author_id from public.books b where b.id = new.book_id;
  if book_author_id is not null then
    select count(*) into writer_cnt
      from public.shelf s
      join public.books b on b.id = s.book_id
      where b.author_id = book_author_id;
    if writer_cnt >= 10 then
      insert into public.user_badges (user_id, badge_key)
      values (book_author_id, 'bestseller')
      on conflict do nothing;
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_award_shelf_badges on public.shelf;
create trigger trg_award_shelf_badges
  after insert on public.shelf
  for each row execute function public.award_shelf_badges();

create or replace function public.award_marathoner()
returns trigger as $$
declare
  finished_cnt int;
begin
  if new.finished_at is not null and (old.finished_at is null) then
    select count(distinct book_id) into finished_cnt
      from public.reading_progress
      where user_id = new.user_id
        and finished_at is not null
        and finished_at >= now() - interval '30 days';
    if finished_cnt >= 5 then
      insert into public.user_badges (user_id, badge_key)
      values (new.user_id, 'marathoner')
      on conflict do nothing;
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_award_marathoner on public.reading_progress;
create trigger trg_award_marathoner
  after insert or update on public.reading_progress
  for each row execute function public.award_marathoner();

create or replace function public.award_founder_badge()
returns trigger as $$
begin
  if new.is_admin then
    insert into public.user_badges (user_id, badge_key)
    values (new.id, 'founder')
    on conflict do nothing;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_award_founder on public.profiles;
create trigger trg_award_founder
  after insert or update on public.profiles
  for each row execute function public.award_founder_badge();

create or replace function public.award_top_author()
returns trigger as $$
declare
  book_author_id uuid;
  total_likes int;
begin
  select b.author_id into book_author_id
    from public.chapters c
    join public.books b on b.id = c.book_id
    where c.id = new.chapter_id;

  if book_author_id is not null then
    select count(*) into total_likes
      from public.chapter_likes cl
      join public.chapters c on c.id = cl.chapter_id
      join public.books b on b.id = c.book_id
      where b.author_id = book_author_id;

    if total_likes >= 50 then
      insert into public.user_badges (user_id, badge_key)
      values (book_author_id, 'top_author')
      on conflict do nothing;
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_award_top_author on public.chapter_likes;
create trigger trg_award_top_author
  after insert on public.chapter_likes
  for each row execute function public.award_top_author();

create or replace function public.award_most_read()
returns trigger as $$
begin
  if new.views >= 500 and old.views < 500 then
    insert into public.user_badges (user_id, badge_key)
    select b.author_id, 'most_read'
    from public.books b
    where b.id = new.book_id
    on conflict do nothing;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_award_most_read on public.chapters;
create trigger trg_award_most_read
  after update on public.chapters
  for each row execute function public.award_most_read();

create or replace function public.award_readers_choice()
returns trigger as $$
declare
  book_author_id uuid;
  rating_count int;
  avg_rating numeric;
begin
  select b.author_id into book_author_id from public.books b where b.id = new.book_id;

  select count(*), avg(rating) into rating_count, avg_rating
    from public.book_ratings where book_id = new.book_id;

  if rating_count >= 10 and avg_rating >= 4.5 and book_author_id is not null then
    insert into public.user_badges (user_id, badge_key)
    values (book_author_id, 'readers_choice')
    on conflict do nothing;
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_award_readers_choice on public.book_ratings;
create trigger trg_award_readers_choice
  after insert or update on public.book_ratings
  for each row execute function public.award_readers_choice();

-- In-app notifications (bell icon). Populated by triggers so any write
-- path (this app, future admin tools, direct SQL) produces them
-- consistently — mirrors the push-notification trigger points but as
-- durable rows a person can revisit, not just a one-shot push.
create or replace function public.notify_new_chapter()
returns trigger as $$
declare
  v_book record;
begin
  select id, slug, title, status into v_book from public.books where id = new.book_id;
  if v_book.status = 'published' then
    insert into public.notifications (user_id, type, message, url)
    select s.user_id, 'new_chapter',
           v_book.title || ': ' || new.chapter_number || '-тарау жарияланды',
           '/kitaptar/' || v_book.slug || '/' || new.chapter_number
    from public.shelf s
    left join public.notification_preferences np on np.user_id = s.user_id
    where s.book_id = v_book.id
      and coalesce(np.new_chapter, true);
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_notify_new_chapter on public.chapters;
create trigger trg_notify_new_chapter
  after insert on public.chapters
  for each row execute function public.notify_new_chapter();

create or replace function public.notify_thread_reply()
returns trigger as $$
declare
  v_thread_owner uuid;
  v_thread_title text;
  v_dorama_slug text;
  v_wants_it boolean;
begin
  select t.user_id, t.title, d.slug
    into v_thread_owner, v_thread_title, v_dorama_slug
    from public.dorama_threads t
    join public.doramas d on d.id = t.dorama_id
    where t.id = new.thread_id;

  if v_thread_owner is not null and v_thread_owner <> new.user_id then
    select coalesce(dorama, true) into v_wants_it
      from public.notification_preferences where user_id = v_thread_owner;
    if coalesce(v_wants_it, true) then
      insert into public.notifications (user_id, type, message, url)
      values (
        v_thread_owner,
        'thread_reply',
        '«' || v_thread_title || '» тақырыбына жауап келді',
        '/dorama/' || v_dorama_slug || '/taqyryp/' || new.thread_id
      );
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_notify_thread_reply on public.dorama_thread_replies;
create trigger trg_notify_thread_reply
  after insert on public.dorama_thread_replies
  for each row execute function public.notify_thread_reply();

create or replace function public.notify_book_comment()
returns trigger as $$
declare
  v_book record;
  v_wants_it boolean;
begin
  select id, slug, title, author_id into v_book from public.books where id = new.book_id;
  if v_book.author_id is not null and v_book.author_id <> new.user_id then
    select coalesce(comments, true) into v_wants_it
      from public.notification_preferences where user_id = v_book.author_id;
    if coalesce(v_wants_it, true) then
      insert into public.notifications (user_id, type, message, url)
      values (
        v_book.author_id,
        'new_comment',
        '«' || v_book.title || '» кітабына пікір жазылды',
        '/kitaptar/' || v_book.slug
      );
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_notify_book_comment on public.comments;
create trigger trg_notify_book_comment
  after insert on public.comments
  for each row execute function public.notify_book_comment();

-- ==========================================================================
-- Row Level Security
-- ==========================================================================
alter table public.profiles enable row level security;
alter table public.books enable row level security;
alter table public.chapters enable row level security;
alter table public.shelf enable row level security;
alter table public.reading_progress enable row level security;
alter table public.comments enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.reports enable row level security;
alter table public.notifications enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.support_tickets enable row level security;
alter table public.doramas enable row level security;
alter table public.dorama_threads enable row level security;
alter table public.dorama_thread_replies enable row level security;
alter table public.chapter_likes enable row level security;
alter table public.book_ratings enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;

-- profiles: everyone can read basic profile info; only the owner edits it
drop policy if exists "profiles are viewable by everyone" on public.profiles;
create policy "profiles are viewable by everyone"
  on public.profiles for select using (true);
drop policy if exists "users can update their own profile" on public.profiles;
create policy "users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- The policy above only restricts which ROW a user can touch, not which
-- COLUMNS — without this guard, any authenticated user could PATCH their
-- own is_admin to true via a direct API call. Service-role requests
-- (our backend routes) are unaffected.
create or replace function public.protect_admin_flag()
returns trigger as $$
begin
  -- Guard by Postgres ROLE, not JWT claims — PostgREST always executes
  -- a logged-in end-user's request as the 'authenticated' role (or
  -- 'anon' when logged out), so that's the only role that should ever
  -- be blocked from touching is_admin. The SQL Editor, migrations, and
  -- our own service_role backend calls run as 'postgres'/'service_role'
  -- and are always trusted. (An earlier version tried to infer this
  -- from request.jwt.claims instead, but that also silently reverted
  -- the documented "make yourself admin" SQL Editor step — this check
  -- doesn't have that failure mode.)
  if new.is_admin is distinct from old.is_admin
     and current_user in ('authenticated', 'anon') then
    new.is_admin := old.is_admin;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists guard_is_admin on public.profiles;
create trigger guard_is_admin
  before update on public.profiles
  for each row execute function public.protect_admin_flag();

-- Admin implies writer (the founder always has both). Runs BEFORE so it
-- can mutate NEW, and after guard_is_admin (alphabetically later) so it
-- sees the already-normalized is_admin value.
create or replace function public.sync_writer_flag()
returns trigger as $$
begin
  if new.is_admin then
    new.is_writer := true;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_sync_writer_flag on public.profiles;
create trigger trg_sync_writer_flag
  before insert or update on public.profiles
  for each row execute function public.sync_writer_flag();

-- books: published books are public; drafts + writes are admin-only
drop policy if exists "published books are viewable by everyone" on public.books;
create policy "published books are viewable by everyone"
  on public.books for select using (
    status = 'published' or auth.uid() = author_id
  );
drop policy if exists "only admin can write books" on public.books;
create policy "only admin can write books"
  on public.books for insert with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_writer)
  );
drop policy if exists "only admin can update own books" on public.books;
create policy "only admin can update own books"
  on public.books for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_writer)
    and author_id = auth.uid()
  );
drop policy if exists "only admin can delete own books" on public.books;
create policy "only admin can delete own books"
  on public.books for delete using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_writer)
    and author_id = auth.uid()
  );

-- chapters: readable if parent book is published (or you're the admin author)
drop policy if exists "chapters of published books are viewable" on public.chapters;
create policy "chapters of published books are viewable"
  on public.chapters for select using (
    exists (
      select 1 from public.books b
      where b.id = chapters.book_id
        and (b.status = 'published' or b.author_id = auth.uid())
    )
  );
drop policy if exists "only admin can write chapters" on public.chapters;
create policy "only admin can write chapters"
  on public.chapters for all using (
    exists (
      select 1 from public.books b
      join public.profiles p on p.id = b.author_id
      where b.id = chapters.book_id and b.author_id = auth.uid() and p.is_writer
    )
  );

-- shelf: users manage only their own shelf
drop policy if exists "users manage their own shelf" on public.shelf;
create policy "users manage their own shelf"
  on public.shelf for all using (auth.uid() = user_id);

-- reading_progress: users manage only their own progress
drop policy if exists "users manage their own reading progress" on public.reading_progress;
create policy "users manage their own reading progress"
  on public.reading_progress for all using (auth.uid() = user_id);

-- comments: everyone can read, authenticated users write their own,
-- authors can delete their own comments
drop policy if exists "comments are viewable by everyone" on public.comments;
create policy "comments are viewable by everyone"
  on public.comments for select using (true);
drop policy if exists "authenticated users can comment" on public.comments;
create policy "authenticated users can comment"
  on public.comments for insert with check (auth.uid() = user_id);
drop policy if exists "users can delete their own comments" on public.comments;
create policy "users can delete their own comments"
  on public.comments for delete using (auth.uid() = user_id);

drop policy if exists "admin can delete any comment" on public.comments;
create policy "admin can delete any comment"
  on public.comments for delete using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

-- push_subscriptions: users manage only their own subscriptions.
-- Reading across users is intentionally NOT allowed here — the
-- notify API route uses the service role key, which bypasses RLS.
drop policy if exists "users manage their own push subscriptions" on public.push_subscriptions;
create policy "users manage their own push subscriptions"
  on public.push_subscriptions for all using (auth.uid() = user_id);

-- reports: any authenticated user can file one; only admin can read/update
-- the queue (deleting the reported content itself goes through the
-- separate "admin can delete any comment" policy above).
drop policy if exists "authenticated users can file a report" on public.reports;
create policy "authenticated users can file a report"
  on public.reports for insert with check (auth.uid() = reporter_id);

drop policy if exists "admin can view all reports" on public.reports;
create policy "admin can view all reports"
  on public.reports for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

drop policy if exists "admin can update reports" on public.reports;
create policy "admin can update reports"
  on public.reports for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

-- notifications: strictly private — a person only ever sees or marks
-- read their own. No insert policy at all for regular users; only the
-- security-definer trigger functions above ever write here.
drop policy if exists "users see their own notifications" on public.notifications;
create policy "users see their own notifications"
  on public.notifications for select using (auth.uid() = user_id);

drop policy if exists "users can mark their own notifications read" on public.notifications;
create policy "users can mark their own notifications read"
  on public.notifications for update using (auth.uid() = user_id);

-- notification_preferences: strictly own row, read/write.
drop policy if exists "users manage their own notification prefs" on public.notification_preferences;
create policy "users manage their own notification prefs"
  on public.notification_preferences for all using (auth.uid() = user_id);

-- support_tickets: a person can file and read their own; admin can read
-- and resolve everyone's.
drop policy if exists "users can file their own support tickets" on public.support_tickets;
create policy "users can file their own support tickets"
  on public.support_tickets for insert with check (auth.uid() = user_id);

drop policy if exists "users can view their own support tickets" on public.support_tickets;
create policy "users can view their own support tickets"
  on public.support_tickets for select using (auth.uid() = user_id);

drop policy if exists "admin can view all support tickets" on public.support_tickets;
create policy "admin can view all support tickets"
  on public.support_tickets for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

drop policy if exists "admin can resolve support tickets" on public.support_tickets;
create policy "admin can resolve support tickets"
  on public.support_tickets for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

-- badges/user_badges: readable by everyone (they're shown on profiles);
-- no insert/update/delete policy for regular users at all — the award_*
-- trigger functions are security definer and bypass RLS, which is the
-- only path that should ever write here.
drop policy if exists "badge catalog is public" on public.badges;
create policy "badge catalog is public"
  on public.badges for select using (true);

-- chapter_likes: like counts are public; a reader can only ever add or
-- remove their own heart.
drop policy if exists "chapter likes are viewable by everyone" on public.chapter_likes;
create policy "chapter likes are viewable by everyone"
  on public.chapter_likes for select using (true);

drop policy if exists "users manage their own chapter likes" on public.chapter_likes;
create policy "users manage their own chapter likes"
  on public.chapter_likes for all using (auth.uid() = user_id);

-- book_ratings: ratings/averages are public; a reader can only ever set
-- or change their own star rating for a book.
drop policy if exists "book ratings are viewable by everyone" on public.book_ratings;
create policy "book ratings are viewable by everyone"
  on public.book_ratings for select using (true);

drop policy if exists "users manage their own book rating" on public.book_ratings;
create policy "users manage their own book rating"
  on public.book_ratings for all using (auth.uid() = user_id);

drop policy if exists "earned badges are public" on public.user_badges;
create policy "earned badges are public"
  on public.user_badges for select using (true);

-- doramas: published entries are public; only admin writes them (same
-- single-admin-writer model as books)
drop policy if exists "published doramas are viewable by everyone" on public.doramas;
create policy "published doramas are viewable by everyone"
  on public.doramas for select using (
    status = 'published' or auth.uid() = created_by
  );

drop policy if exists "only admin can write doramas" on public.doramas;
create policy "only admin can write doramas"
  on public.doramas for insert with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_writer)
  );

drop policy if exists "only admin can update doramas" on public.doramas;
create policy "only admin can update doramas"
  on public.doramas for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_writer)
  );

drop policy if exists "only admin can delete doramas" on public.doramas;
create policy "only admin can delete doramas"
  on public.doramas for delete using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_writer)
  );

-- dorama_threads/dorama_thread_replies: everyone reads, authenticated
-- users start threads and reply, admin can moderate any of it. This is
-- a real forum (thread list -> thread detail with replies), not a flat
-- comment list — matching what the spec actually described for the
-- per-dorama "Топтар" (community groups).
drop policy if exists "dorama threads are viewable by everyone" on public.dorama_threads;
create policy "dorama threads are viewable by everyone"
  on public.dorama_threads for select using (true);

drop policy if exists "authenticated users can start dorama threads" on public.dorama_threads;
create policy "authenticated users can start dorama threads"
  on public.dorama_threads for insert with check (auth.uid() = user_id);

drop policy if exists "users can delete their own dorama threads" on public.dorama_threads;
create policy "users can delete their own dorama threads"
  on public.dorama_threads for delete using (auth.uid() = user_id);

drop policy if exists "admin can delete any dorama thread" on public.dorama_threads;
create policy "admin can delete any dorama thread"
  on public.dorama_threads for delete using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

drop policy if exists "dorama thread replies are viewable by everyone" on public.dorama_thread_replies;
create policy "dorama thread replies are viewable by everyone"
  on public.dorama_thread_replies for select using (true);

drop policy if exists "authenticated users can reply in dorama threads" on public.dorama_thread_replies;
create policy "authenticated users can reply in dorama threads"
  on public.dorama_thread_replies for insert with check (auth.uid() = user_id);

drop policy if exists "users can delete their own dorama thread replies" on public.dorama_thread_replies;
create policy "users can delete their own dorama thread replies"
  on public.dorama_thread_replies for delete using (auth.uid() = user_id);

drop policy if exists "admin can delete any dorama thread reply" on public.dorama_thread_replies;
create policy "admin can delete any dorama thread reply"
  on public.dorama_thread_replies for delete using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

-- ==========================================================================
-- Single-admin-writer safeguard: prevents more than one profile being
-- flagged is_admin = true at the database level.
-- ==========================================================================
create unique index if not exists only_one_admin
  on public.profiles ((is_admin))
  where is_admin = true;

-- ==========================================================================
-- Storage: book covers
-- ==========================================================================
insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do nothing;

drop policy if exists "covers are publicly readable" on storage.objects;
create policy "covers are publicly readable"
  on storage.objects for select using (bucket_id = 'covers');

drop policy if exists "admin can upload covers" on storage.objects;
create policy "admin can upload covers"
  on storage.objects for insert with check (
    bucket_id = 'covers'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_writer)
  );

drop policy if exists "admin can update covers" on storage.objects;
create policy "admin can update covers"
  on storage.objects for update using (
    bucket_id = 'covers'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_writer)
  );

drop policy if exists "admin can delete covers" on storage.objects;
create policy "admin can delete covers"
  on storage.objects for delete using (
    bucket_id = 'covers'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_writer)
  );

-- ==========================================================================
-- Storage: user avatars — each user manages only their own file, stored
-- at <user_id>/avatar.<ext> so the folder name doubles as an ownership check.
-- ==========================================================================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatars are publicly readable" on storage.objects;
create policy "avatars are publicly readable"
  on storage.objects for select using (bucket_id = 'avatars');

drop policy if exists "users can upload their own avatar" on storage.objects;
create policy "users can upload their own avatar"
  on storage.objects for insert with check (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "users can update their own avatar" on storage.objects;
create policy "users can update their own avatar"
  on storage.objects for update using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "users can delete their own avatar" on storage.objects;
create policy "users can delete their own avatar"
  on storage.objects for delete using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ==========================================================================
-- Base privileges. RLS policies above decide what each row-level
-- operation is allowed to see/touch, but Postgres also checks a more
-- basic table-level GRANT first — without it you get "permission denied
-- for table X" regardless of how permissive the RLS policies are. Supabase
-- normally sets this up automatically, but re-run it here defensively;
-- it's idempotent and safe (RLS still applies on top of it).
-- ==========================================================================
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant all on all routines in schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant all on routines to anon, authenticated, service_role;

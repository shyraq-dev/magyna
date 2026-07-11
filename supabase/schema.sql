-- ============================================================
-- Maǵyna — Supabase schema (v3, толық)
-- Story & Book Writing App ТТ (детальды нұсқа) негізінде
-- Жалғыз автор моделі: тек admin рөліндегі пайдаланушы жазады,
-- қалғандары тек оқиды.
--
-- ЕСКЕРТУ: бұл файл жаңа Supabase жобасына БІР РЕТ толық іске
-- қосуға арналған. Егер жобаңызда бұрыннан v2 схема бар болса,
-- бұл файлды қайта жүргізбеңіз — оның орнына
-- migration_002_profile_trigger.sql және migration_003_full_spec.sql
-- файлдарын ретімен іске қосыңыз.
-- ============================================================

-- ============================================================
-- Профильдер (auth.users кеңейтуі)
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  socials jsonb default '{}'::jsonb,
  role text not null default 'reader' check (role in ('reader', 'admin')),
  is_banned boolean not null default false,
  banned_until timestamptz,
  banned_reason text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Жанрлар / санаттар
-- ============================================================
create table public.genres (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  slug text unique not null
);

-- ============================================================
-- Кітаптар / оқиғалар
-- ============================================================
create table public.books (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  cover_url text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  writing_status text not null default 'in_progress' check (writing_status in ('in_progress', 'completed')),
  is_featured boolean not null default false,
  word_count integer not null default 0,
  views_count integer not null default 0,
  likes_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_vector tsvector
);

create table public.book_genres (
  book_id uuid references public.books(id) on delete cascade,
  genre_id uuid references public.genres(id) on delete cascade,
  primary key (book_id, genre_id)
);

create table public.book_tags (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  tag text not null
);

-- ============================================================
-- Тараулар
-- ============================================================
create table public.chapters (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  title text not null,
  content text not null default '',
  order_index integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published')),
  scheduled_at timestamptz,
  views_count integer not null default 0,
  likes_count integer not null default 0,
  word_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.chapter_likes (
  user_id uuid references public.profiles(id) on delete cascade,
  chapter_id uuid references public.chapters(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, chapter_id)
);

-- Кітап оқылымдарының уақыт белгісі (белсенділік графигі үшін)
create table public.book_view_events (
  id bigint generated always as identity primary key,
  book_id uuid not null references public.books(id) on delete cascade,
  viewed_at timestamptz not null default now()
);

-- ============================================================
-- Оқу барысы (соңғы оқылған жер, бетбелгі)
-- ============================================================
create table public.reading_progress (
  user_id uuid references public.profiles(id) on delete cascade,
  book_id uuid references public.books(id) on delete cascade,
  chapter_id uuid references public.chapters(id) on delete set null,
  scroll_position numeric default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, book_id)
);

-- ============================================================
-- Таңдаулылар (Library)
-- ============================================================
create table public.library (
  user_id uuid references public.profiles(id) on delete cascade,
  book_id uuid references public.books(id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (user_id, book_id)
);

-- ============================================================
-- Пікірлер (кітапқа немесе абзацқа)
-- ============================================================
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  chapter_id uuid references public.chapters(id) on delete cascade,
  paragraph_index integer,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Рейтинг
-- ============================================================
create table public.ratings (
  user_id uuid references public.profiles(id) on delete cascade,
  book_id uuid references public.books(id) on delete cascade,
  score smallint not null check (score between 1 and 5),
  created_at timestamptz not null default now(),
  primary key (user_id, book_id)
);

-- ============================================================
-- Дәйексөздер (Quote highlight & share)
-- ============================================================
create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  text_snippet text not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Шағымдану жүйесі (Report system)
-- ============================================================
create table public.reports (
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
-- Қолдау қызметі (Support tickets)
-- ============================================================
create table public.support_tickets (
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
-- Хабарландырулар (in-app notifications)
-- ============================================================
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('new_comment', 'new_chapter', 'new_rating', 'ticket_reply')),
  message text not null,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Индекстер
-- ============================================================
create index idx_books_status on public.books(status);
create index idx_books_author on public.books(author_id);
create index idx_books_featured on public.books(is_featured) where is_featured = true;
create index idx_chapters_book on public.chapters(book_id, order_index);
create index idx_comments_book on public.comments(book_id);
create index idx_notifications_user on public.notifications(user_id, is_read, created_at desc);
create index idx_books_search on public.books using gin(search_vector);
create index idx_book_view_events_book on public.book_view_events(book_id, viewed_at);

-- ============================================================
-- Толық мәтінді іздеу (Full-text search)
-- ============================================================
create function public.books_search_vector_update() returns trigger as $$
begin
  new.search_vector :=
    setweight(to_tsvector('simple', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(new.description, '')), 'B');
  return new;
end;
$$ language plpgsql;

create trigger trg_books_search_vector
  before insert or update of title, description on public.books
  for each row execute function public.books_search_vector_update();

-- ============================================================
-- Жаңа пайдаланушы тіркелгенде профильді автоматты жасау
-- ============================================================
create function public.handle_new_user() returns trigger as $$
declare
  v_username text;
begin
  v_username := coalesce(
    nullif(trim(new.raw_user_meta_data->>'username'), ''),
    split_part(new.email, '@', 1)
  );

  begin
    insert into public.profiles (id, username, display_name)
    values (new.id, v_username, v_username);
  exception
    when unique_violation then
      insert into public.profiles (id, username, display_name)
      values (new.id, v_username || '_' || substr(new.id::text, 1, 6), v_username);
  end;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Хабарландыру триггерлері
-- ============================================================

-- Жаңа пікір қалдырылғанда — кітап авторына хабарлау
create function public.notify_new_comment() returns trigger as $$
declare
  v_author_id uuid;
  v_book_title text;
  v_commenter text;
begin
  select author_id, title into v_author_id, v_book_title from public.books where id = new.book_id;
  if v_author_id is not null and v_author_id <> new.user_id then
    select coalesce(display_name, username) into v_commenter from public.profiles where id = new.user_id;
    insert into public.notifications (user_id, type, message, link)
    values (
      v_author_id,
      'new_comment',
      v_commenter || ' сіздің "' || v_book_title || '" кітабыңызға пікір қалдырды',
      '/books/' || new.book_id
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_notify_new_comment
  after insert on public.comments
  for each row execute function public.notify_new_comment();

-- Тарау жарияланғанда — кітапты таңдаулыға қосқан оқырмандарға хабарлау
create function public.notify_new_chapter() returns trigger as $$
declare
  v_book_title text;
begin
  if new.status = 'published' and (old.status is distinct from new.status) then
    select title into v_book_title from public.books where id = new.book_id;
    insert into public.notifications (user_id, type, message, link)
    select l.user_id, 'new_chapter', '"' || v_book_title || '" кітabына жаңа тарау қосылды: ' || new.title,
           '/books/' || new.book_id || '?chapter=' || new.id
    from public.library l
    where l.book_id = new.book_id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_notify_new_chapter
  after update on public.chapters
  for each row execute function public.notify_new_chapter();

-- Қолдау билетіне жауап берілгенде — пайдаланушыға хабарлау
create function public.notify_ticket_reply() returns trigger as $$
begin
  if new.admin_reply is not null and (old.admin_reply is distinct from new.admin_reply) then
    insert into public.notifications (user_id, type, message, link)
    values (new.user_id, 'ticket_reply', 'Қолдау қызметі сіздің билетіңізге жауап берді', '/support');
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_notify_ticket_reply
  after update on public.support_tickets
  for each row execute function public.notify_ticket_reply();

-- ============================================================
-- Жоспарлы жариялау (pg_cron арқылы автоматты publish)
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
  '* * * * *',
  $$select public.publish_scheduled_chapters();$$
);

-- Бұғаттау мерзімі аяқталғанда автоматты босату
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

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================
alter table public.profiles enable row level security;
alter table public.books enable row level security;
alter table public.chapters enable row level security;
alter table public.chapter_likes enable row level security;
alter table public.book_view_events enable row level security;
alter table public.reading_progress enable row level security;
alter table public.library enable row level security;
alter table public.comments enable row level security;
alter table public.ratings enable row level security;
alter table public.quotes enable row level security;
alter table public.reports enable row level security;
alter table public.support_tickets enable row level security;
alter table public.notifications enable row level security;

-- Профильдер: барлығы оқи алады, тек иесі өзгерте алады
create policy "Profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Кітаптар: оқу — барлығына (жарияланған болса) немесе админге,
-- жазу/өзгерту/өшіру — тек admin рөліндегі пайдаланушыға (жалғыз автор моделі)
create policy "Published books are public" on public.books for select
  using (
    status = 'published'
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
create policy "Only admin creates books" on public.books for insert
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "Only admin updates books" on public.books for update
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "Only admin deletes books" on public.books for delete
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Тараулар: аналогты логика — тек admin жазады
create policy "Published chapters are public" on public.chapters for select
  using (
    status = 'published'
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
create policy "Only admin creates chapters" on public.chapters for insert
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "Only admin updates chapters" on public.chapters for update
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "Only admin deletes chapters" on public.chapters for delete
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "Users manage own chapter likes" on public.chapter_likes for all using (auth.uid() = user_id);
create policy "Chapter likes are public" on public.chapter_likes for select using (true);

create policy "Anyone can log a view event" on public.book_view_events for insert with check (true);
create policy "Admin reads view events" on public.book_view_events for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Оқу барысы / Library / Пікірлер / Рейтинг / Дәйексөздер: тек өз жазбалары
create policy "Users manage own reading progress" on public.reading_progress for all using (auth.uid() = user_id);
create policy "Users manage own library" on public.library for all using (auth.uid() = user_id);
create policy "Comments are public" on public.comments for select using (true);
create policy "Users write own comments" on public.comments for insert with check (auth.uid() = user_id);
create policy "Users delete own comments" on public.comments for delete using (auth.uid() = user_id);
create policy "Ratings are public" on public.ratings for select using (true);
create policy "Users manage own ratings" on public.ratings for all using (auth.uid() = user_id);
create policy "Users manage own quotes" on public.quotes for all using (auth.uid() = user_id);

-- Шағымдар: пайдаланушы өзінікін жасай/көре алады, admin барлығын басқарады
create policy "Users create reports" on public.reports for insert with check (auth.uid() = reporter_id);
create policy "Users see own reports" on public.reports for select using (auth.uid() = reporter_id);
create policy "Admin manages all reports" on public.reports for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Қолдау билеттері: пайдаланушы өзінікін жасай/көре алады, admin барлығын басқарады
create policy "Users manage own tickets" on public.support_tickets for select using (auth.uid() = user_id);
create policy "Users create tickets" on public.support_tickets for insert with check (auth.uid() = user_id);
create policy "Admin manages all tickets" on public.support_tickets for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Хабарландырулар: тек иесі оқи/жаңарта алады
create policy "Users read own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "Users update own notifications" on public.notifications for update using (auth.uid() = user_id);

-- ============================================================
-- Realtime (хабарландыру звоногы үшін)
-- ============================================================
alter publication supabase_realtime add table public.notifications;

-- ============================================================
-- Бастапқы жанрлар
-- ============================================================
insert into public.genres (name, slug) values
  ('Проза', 'prose'),
  ('Поэзия', 'poetry'),
  ('Детектив', 'detective'),
  ('Фэнтези', 'fantasy'),
  ('Романтика', 'romance'),
  ('Психология', 'psychology'),
  ('Тарихи', 'historical'),
  ('Ғылыми фантастика', 'sci-fi'),
  ('Қорқыныш', 'horror'),
  ('Жасөспірімдерге арналған', 'ya');

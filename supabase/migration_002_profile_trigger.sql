-- Migration 002: жаңа пайдаланушы тіркелгенде профильді автоматты жасау
-- Бұрын профиль client жағынан insert етілетін, бірақ email confirmation
-- қосулы болса, ол кезде әлі сессия жоқ болғандықтан RLS оны блоктайтын.
-- Мына trigger осы мәселені шешеді: профиль auth.users-ке жазба
-- құрылған сәтте серверде, security definer арқылы жасалады.

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

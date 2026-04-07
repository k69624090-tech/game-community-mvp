create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null default 'ゲーマーさん',
  role text not null default 'user' check (role in ('user', 'admin')),
  email text not null unique,
  avatar_url text,
  bio text,
  favorite_games text[],
  created_at timestamptz not null default now()
);

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null unique,
  description text,
  cover_image_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references public.games (id) on delete cascade,
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  unique (game_id, slug)
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  game_id uuid not null references public.games (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete restrict,
  title text,
  body text not null,
  spoiler_flag boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  type text not null check (type in ('like', 'wakaru', 'suki', 'cried', 'lol', 'helpful')),
  created_at timestamptz not null default now(),
  unique (post_id, user_id, type)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('post', 'comment', 'user')),
  target_id uuid not null,
  user_id uuid not null references public.users (id) on delete cascade,
  reason text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_categories_game_id on public.categories (game_id);
create index if not exists idx_posts_game_id on public.posts (game_id);
create index if not exists idx_posts_user_id on public.posts (user_id);
create index if not exists idx_posts_created_at on public.posts (created_at desc);
create index if not exists idx_comments_post_id on public.comments (post_id);
create index if not exists idx_reactions_post_id on public.reactions (post_id);
create index if not exists idx_reports_target on public.reports (target_type, target_id);
create index if not exists idx_users_role on public.users (role);
create index if not exists idx_reports_created_at on public.reports (created_at desc);

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
before update on public.posts
for each row
execute function public.handle_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, username)
  values (new.id, new.email, coalesce(split_part(new.email, '@', 1), 'ゲーマーさん'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();

alter table public.users enable row level security;
alter table public.games enable row level security;
alter table public.categories enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.reactions enable row level security;
alter table public.reports enable row level security;

drop policy if exists "users_select_public" on public.users;
create policy "users_select_public"
on public.users for select
using (true);

drop policy if exists "users_update_own" on public.users;
create policy "users_update_own"
on public.users for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "games_select_public" on public.games;
create policy "games_select_public"
on public.games for select
using (true);

drop policy if exists "categories_select_public" on public.categories;
create policy "categories_select_public"
on public.categories for select
using (true);

drop policy if exists "posts_select_public" on public.posts;
create policy "posts_select_public"
on public.posts for select
using (true);

drop policy if exists "posts_insert_authenticated" on public.posts;
create policy "posts_insert_authenticated"
on public.posts for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "posts_update_own" on public.posts;
create policy "posts_update_own"
on public.posts for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "posts_delete_own" on public.posts;
create policy "posts_delete_own"
on public.posts for delete
using (auth.uid() = user_id);

drop policy if exists "comments_select_public" on public.comments;
create policy "comments_select_public"
on public.comments for select
using (true);

drop policy if exists "comments_insert_authenticated" on public.comments;
create policy "comments_insert_authenticated"
on public.comments for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "comments_update_own" on public.comments;
create policy "comments_update_own"
on public.comments for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "comments_delete_own" on public.comments;
create policy "comments_delete_own"
on public.comments for delete
using (auth.uid() = user_id);

drop policy if exists "reactions_select_public" on public.reactions;
create policy "reactions_select_public"
on public.reactions for select
using (true);

drop policy if exists "reactions_insert_authenticated" on public.reactions;
create policy "reactions_insert_authenticated"
on public.reactions for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "reactions_delete_own" on public.reactions;
create policy "reactions_delete_own"
on public.reactions for delete
using (auth.uid() = user_id);

drop policy if exists "reports_insert_authenticated" on public.reports;
create policy "reports_insert_authenticated"
on public.reports for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "reports_select_own" on public.reports;
create policy "reports_select_own"
on public.reports for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "reports_select_admin" on public.reports;
create policy "reports_select_admin"
on public.reports for select
to authenticated
using (
  exists (
    select 1
    from public.users admin_user
    where admin_user.id = auth.uid() and admin_user.role = 'admin'
  )
);

drop policy if exists "posts_delete_admin" on public.posts;
create policy "posts_delete_admin"
on public.posts for delete
to authenticated
using (
  exists (
    select 1
    from public.users admin_user
    where admin_user.id = auth.uid() and admin_user.role = 'admin'
  )
);

drop policy if exists "comments_delete_admin" on public.comments;
create policy "comments_delete_admin"
on public.comments for delete
to authenticated
using (
  exists (
    select 1
    from public.users admin_user
    where admin_user.id = auth.uid() and admin_user.role = 'admin'
  )
);

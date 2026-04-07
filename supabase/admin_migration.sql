alter table public.users
add column if not exists role text not null default 'user';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'users_role_check'
  ) then
    alter table public.users
    add constraint users_role_check check (role in ('user', 'admin'));
  end if;
end $$;

create index if not exists idx_users_role on public.users (role);
create index if not exists idx_reports_created_at on public.reports (created_at desc);

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

-- 最初の管理者を付与する例（メールアドレスは置き換えてください）
-- update public.users set role = 'admin' where email = 'your-admin@example.com';

-- ============================================================
-- 08_role_permission_separation.sql  —  役割と操作権限の分離（案B）
--
-- これまで profiles.role（member/coach/admin）が「表示上の立場」と
-- 「操作権限」を兼ねていたため、「コーチ表示のまま管理操作も持たせる」
-- ことができませんでした。
--
-- この migration で行うこと：
--   1. permissions テーブルを新設し、「誰が」「どの操作を」できるかを
--      role とは独立して管理できるようにする
--   2. 既存の role='admin' のユーザーを role='coach' に変更した上で、
--      'manage_roles' 権限を付与する（できることは変わらない）
--   3. role の取りうる値を member / coach の2値に変更する
--   4. is_admin() / is_coach() 関数の中身だけを新しい仕組みに差し替える
--      （02_rls.sql 側のポリシーは一切変更不要）
--   5. 権限の付与・剥奪を行う関数と、その監査ログテーブルを追加する
-- ============================================================
begin;

-- ---------- 1. 権限テーブル ----------
create table if not exists public.permissions (
  user_id         uuid not null references public.profiles(id) on delete cascade,
  permission_key  text not null,
  granted_by      uuid references public.profiles(id) on delete set null,
  granted_at      timestamptz not null default now(),
  primary key (user_id, permission_key)
);
comment on table public.permissions is
  '役割（role）とは独立した操作権限。今のところ manage_roles のみ使用。今後コメント機能などで種類を増やす想定。';

create table if not exists public.permission_changes (
  id              uuid primary key default gen_random_uuid(),
  target_id       uuid not null references public.profiles(id) on delete cascade,
  permission_key  text not null,
  action          text not null check (action in ('granted', 'revoked')),
  changed_by      uuid references public.profiles(id) on delete set null,
  changed_at      timestamptz not null default now()
);

-- ---------- 2. 既存の admin を coach + manage_roles 権限に移行 ----------
insert into public.permissions (user_id, permission_key)
select id, 'manage_roles' from public.profiles where role = 'admin'
on conflict (user_id, permission_key) do nothing;

update public.profiles set role = 'coach' where role = 'admin';

-- ---------- 3. role の取りうる値を member / coach に変更 ----------
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('member', 'coach'));

-- ---------- 4. is_admin() / is_coach() の中身を差し替え ----------
-- 関数名は変えていないので、02_rls.sql のポリシーは無修正で動く。
create or replace function public.has_permission(key text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.permissions
    where user_id = auth.uid() and permission_key = key
  );
$$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select public.has_permission('manage_roles');
$$;

create or replace function public.is_coach() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'coach')
         or public.has_permission('manage_roles');
$$;

-- ---------- 5. 権限の付与・剥奪用の関数 ----------
create or replace function public.admin_grant_permission(target uuid, key text)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception '権限を付与できるのは管理操作の権限を持つ人だけです';
  end if;

  insert into public.permissions (user_id, permission_key, granted_by)
  values (target, key, auth.uid())
  on conflict (user_id, permission_key) do nothing;

  insert into public.permission_changes (target_id, permission_key, action, changed_by)
  values (target, key, 'granted', auth.uid());
end;
$$;

create or replace function public.admin_revoke_permission(target uuid, key text)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception '権限を剥奪できるのは管理操作の権限を持つ人だけです';
  end if;

  delete from public.permissions where user_id = target and permission_key = key;

  insert into public.permission_changes (target_id, permission_key, action, changed_by)
  values (target, key, 'revoked', auth.uid());
end;
$$;

-- admin_set_role（05_admin_functions.sql）は role が member/coach の
-- 2値になったことに合わせて更新
create or replace function public.admin_set_role(target uuid, new_role text)
returns void
language plpgsql security definer set search_path = public as $$
declare
  old_role text;
begin
  if not public.is_admin() then
    raise exception '役割を変更できるのは管理操作の権限を持つ人だけです';
  end if;

  if new_role not in ('member', 'coach') then
    raise exception '不正な役割です: %', new_role;
  end if;

  select role into old_role from public.profiles where id = target;

  if old_role is null then
    raise exception '対象の会員が見つかりません';
  end if;

  if old_role = new_role then
    return;
  end if;

  update public.profiles set role = new_role where id = target;

  insert into public.role_changes (target_id, from_role, to_role, changed_by)
  values (target, old_role, new_role, auth.uid());
end;
$$;

-- ---------- RLS ----------
alter table public.permissions enable row level security;
alter table public.permission_changes enable row level security;

drop policy if exists permissions_select on public.permissions;
create policy permissions_select on public.permissions
  for select to authenticated using (user_id = auth.uid() or public.is_admin());

drop policy if exists permission_changes_select on public.permission_changes;
create policy permission_changes_select on public.permission_changes
  for select to authenticated using (public.is_admin());

-- 06_fix_grants.sql で default privileges を設定済みなら不要だが、念のため明示しておく
grant select, insert, update, delete on public.permissions, public.permission_changes to authenticated;
grant execute on function public.has_permission(text) to authenticated;
grant execute on function public.admin_grant_permission(uuid, text) to authenticated;
grant execute on function public.admin_revoke_permission(uuid, text) to authenticated;

commit;

-- ============================================================
-- 05_admin_functions.sql  —  追加分
--
-- 01_schema.sql に role_changes（監査ログ）テーブルがありましたが、
-- そこへ書き込む処理がまだ無かったため追加しました。
-- 「role 更新」と「監査ログへの記録」を1つの関数の中で行うことで、
-- 片方だけ実行されて記録が抜ける事故を防ぎます。
--
-- 呼び出し側（画面）は profiles を直接 UPDATE するのではなく、
-- この関数を rpc 経由で呼び出してください。
-- ============================================================
begin;

create or replace function public.admin_set_role(target uuid, new_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  old_role text;
begin
  if not public.is_admin() then
    raise exception '役割を変更できるのは管理者だけです';
  end if;

  if new_role not in ('member','coach','admin') then
    raise exception '不正な役割です: %', new_role;
  end if;

  select role into old_role from public.profiles where id = target;

  if old_role is null then
    raise exception '対象の会員が見つかりません';
  end if;

  if old_role = new_role then
    return; -- 変更なし。監査ログも作らない。
  end if;

  update public.profiles set role = new_role where id = target;

  insert into public.role_changes (target_id, from_role, to_role, changed_by)
  values (target, old_role, new_role, auth.uid());
end;
$$;

commit;

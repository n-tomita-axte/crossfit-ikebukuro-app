-- ============================================================
-- 06_fix_grants.sql  —  権限(GRANT)の復旧
--
-- 経緯: profiles テーブルの衝突を解消するために
--   drop schema public cascade;
--   create schema public;
-- を実行した際、Supabase がプロジェクト作成時に自動設定している
-- 「authenticated ロールが各テーブルを読み書きできる」という
-- 土台の権限(GRANT)も一緒に失われていた。
--
-- RLS（02_rls.sql）はあくまで「どの行を見せるか」を制御するもので、
-- その前提として「そのテーブルに触れてよいか」という GRANT が必要。
-- これが無いと、RLS ポリシーが正しくても
-- "permission denied for table xxx" で全て弾かれる。
--
-- これは1回実行すれば十分。以後、drop schema を再度行わない限り
-- 再実行の必要はない。
-- ============================================================
begin;

-- 既存の全テーブルに対して、認証済みユーザーが読み書きできるようにする
-- （実際に何ができるかは 02_rls.sql の行レベルのポリシーで制御される）
grant select, insert, update, delete on all tables in schema public to authenticated;

-- id列などで使われる sequence（自動採番）へのアクセス権
grant usage, select on all sequences in schema public to authenticated;

-- RLSポリシーの中から呼ばれる関数（is_coach, is_admin）と、
-- 画面から rpc() で呼ぶ admin_set_role の実行権限
grant execute on function public.is_coach() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.admin_set_role(uuid, text) to authenticated;

-- 今後 create table で新しいテーブルを追加したときも、
-- 同じ権限が自動的に付くようにしておく
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public
  grant usage, select on sequences to authenticated;

commit;

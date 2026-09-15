-- ============================================================
-- 02_rls.sql  —  権限設定（Row Level Security）
--
-- ここが守りの本体。画面のコードで制御しない。
-- ブラウザの開発者ツールから直接データベースを叩かれても、
-- ここで許可していないものは返らない／書けない。
-- ============================================================
begin;

alter table public.profiles             enable row level security;
alter table public.programs             enable row level security;
alter table public.workouts             enable row level security;
alter table public.results              enable row level security;
alter table public.result_coach_notes   enable row level security;
alter table public.result_private_notes enable row level security;
alter table public.workout_templates    enable row level security;
alter table public.handovers            enable row level security;
alter table public.role_changes         enable row level security;

-- ---------- profiles ----------
-- 名前とアバターは結果ボードに出るので、ログイン済みなら誰でも読める。
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated using (true);

-- 自分のプロフィールだけ更新できる。
-- role を自分で書き換える件は 01_schema.sql のトリガー guard_role_change() で止める
-- （ポリシー内で同じテーブルを参照すると再帰するため）。
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- 役割の変更は管理者だけ。
drop policy if exists profiles_update_admin on public.profiles;
create policy profiles_update_admin on public.profiles
  for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------- programs ----------
drop policy if exists programs_select on public.programs;
create policy programs_select on public.programs
  for select to authenticated using (true);
drop policy if exists programs_write on public.programs;
create policy programs_write on public.programs
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------- workouts ----------
-- 会員は公開済みだけ。コーチは下書きも見える。
drop policy if exists workouts_select on public.workouts;
create policy workouts_select on public.workouts
  for select to authenticated using (published or public.is_coach());

drop policy if exists workouts_insert on public.workouts;
create policy workouts_insert on public.workouts
  for insert to authenticated with check (public.is_coach());

drop policy if exists workouts_update on public.workouts;
create policy workouts_update on public.workouts
  for update to authenticated using (public.is_coach()) with check (public.is_coach());

-- 削除できるのは、登録した本人と管理者だけ。
drop policy if exists workouts_delete on public.workouts;
create policy workouts_delete on public.workouts
  for delete to authenticated
  using (public.is_admin() or created_by = auth.uid());

-- ---------- results ----------
-- 点数は結果ボードに出るので、全員が読める。
drop policy if exists results_select on public.results;
create policy results_select on public.results
  for select to authenticated using (true);

-- 書けるのは自分の行だけ。他人になりすまして書けない。
drop policy if exists results_write_own on public.results;
create policy results_write_own on public.results
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- コーチは代理入力・修正ができる（現場で本人が入れられないときのため）。
-- 不要なら、この2つを消せばコーチは他人の記録に触れなくなる。
drop policy if exists results_coach_write on public.results;
create policy results_coach_write on public.results
  for all to authenticated using (public.is_coach()) with check (public.is_coach());

-- ---------- コーチに伝えるメモ：本人 ＋ コーチ・管理者 ----------
drop policy if exists coach_notes_select on public.result_coach_notes;
create policy coach_notes_select on public.result_coach_notes
  for select to authenticated
  using (user_id = auth.uid() or public.is_coach());

drop policy if exists coach_notes_write on public.result_coach_notes;
create policy coach_notes_write on public.result_coach_notes
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- 自分だけのメモ：本人だけ。コーチにも管理者にも見えない ----------
drop policy if exists private_notes_all on public.result_private_notes;
create policy private_notes_all on public.result_private_notes
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- テンプレート ----------
drop policy if exists templates_select on public.workout_templates;
create policy templates_select on public.workout_templates
  for select to authenticated using (public.is_coach());
drop policy if exists templates_insert on public.workout_templates;
create policy templates_insert on public.workout_templates
  for insert to authenticated with check (public.is_coach());
drop policy if exists templates_update on public.workout_templates;
create policy templates_update on public.workout_templates
  for update to authenticated using (public.is_coach()) with check (public.is_coach());
drop policy if exists templates_delete on public.workout_templates;
create policy templates_delete on public.workout_templates
  for delete to authenticated
  using (public.is_admin() or created_by = auth.uid());

-- ---------- 申し送り：コーチ・管理者だけ。会員には存在ごと見えない ----------
drop policy if exists handovers_select on public.handovers;
create policy handovers_select on public.handovers
  for select to authenticated using (public.is_coach());
drop policy if exists handovers_insert on public.handovers;
create policy handovers_insert on public.handovers
  for insert to authenticated with check (public.is_coach() and author_id = auth.uid());
drop policy if exists handovers_update on public.handovers;
create policy handovers_update on public.handovers
  for update to authenticated using (public.is_coach()) with check (public.is_coach());
drop policy if exists handovers_delete on public.handovers;
create policy handovers_delete on public.handovers
  for delete to authenticated
  using (public.is_admin() or author_id = auth.uid());

-- ---------- 権限変更の記録：管理者だけが見る。書き換え・削除はできない ----------
drop policy if exists role_changes_select on public.role_changes;
create policy role_changes_select on public.role_changes
  for select to authenticated using (public.is_admin());
drop policy if exists role_changes_insert on public.role_changes;
create policy role_changes_insert on public.role_changes
  for insert to authenticated with check (public.is_admin());

commit;

-- ============================================================
-- 01_schema.sql  —  CrossFit池袋 会員向けアプリ
-- Supabase の SQL Editor に貼って実行する。01 → 02 → 03 → 04 の順。
-- 何度流しても壊れないように書いてある（drop はしない）。
-- ============================================================
begin;

-- ---------- 会員 ----------
-- auth.users（ログイン情報）と 1対1。表示名などはこちらに持つ。
create table if not exists public.profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  display_name      text not null,
  gender_division   text check (gender_division in ('men','women')),  -- null = 回答しない
  role              text not null default 'member'
                    check (role in ('member','coach','admin')),
  default_scaling   text not null default 'RX',
  avatar_url        text,
  created_at        timestamptz not null default now()
);
comment on column public.profiles.gender_division is 'men / women / null（回答しない）';
comment on column public.profiles.role is 'coach と admin だけが入稿できる';

-- ---------- プログラム（トラック）----------
-- CrossFit / HYROX / クロスフィット40。会員は所属しない。
create table if not exists public.programs (
  id          text primary key,
  name        text not null,
  full_name   text not null,
  sort_order  int  not null default 1,
  active      boolean not null default true
);

-- ---------- 種目 ----------
create table if not exists public.workouts (
  id                    uuid primary key default gen_random_uuid(),
  program_id            text not null references public.programs(id),
  date                  date not null,
  title                 text not null,
  body                  text not null,          -- 自由記述。改行をそのまま保つ
  score_type            text not null
                        check (score_type in ('weight','time','reps','rounds_reps','completion')),
  scaling_levels        text[] not null default '{}',   -- {RX,Scaled} または {}
  sort_order            int not null default 1,          -- 1日の中での表示順
  published             boolean not null default false,
  count_in_ranking      boolean not null default true,   -- 重量の種目は既定で false
  coach_note            text not null default '',
  coach_note_updated_at timestamptz,
  created_by            uuid references public.profiles(id) on delete set null,
  created_at            timestamptz not null default now()
);
create index if not exists workouts_program_date_idx on public.workouts (program_id, date);
create index if not exists workouts_date_idx         on public.workouts (date);
comment on column public.workouts.count_in_ranking is
  '重量の種目は「自分の最大の◯%」で指示されるため、絶対重量で順位をつけると体格の順位になる。既定で除外する。';

-- ---------- 記録 ----------
-- 1人1種目につき1件。score_value はタイムなら秒数、重量なら kg。
create table if not exists public.results (
  id               uuid primary key default gen_random_uuid(),
  workout_id       uuid not null references public.workouts(id) on delete cascade,
  user_id          uuid not null references public.profiles(id) on delete cascade,
  score_value      numeric(7,1),
  score_secondary  numeric,        -- rounds_reps のときだけ使う
  completed        boolean,        -- completion のときだけ使う
  scaling          text,
  logged_date      date not null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (workout_id, user_id)
);
create index if not exists results_workout_idx on public.results (workout_id);
create index if not exists results_user_idx    on public.results (user_id, logged_date desc);

-- ---------- メモ2種 ----------
-- RLS は行単位でしか効かないため、見せる相手が違うメモは別テーブルに分ける。
-- results と同じ行に置くと、点数を見せるために行ごと開放することになり、メモも漏れる。
create table if not exists public.result_coach_notes (   -- 本人 ＋ コーチ・管理者
  result_id  uuid primary key references public.results(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  note       text not null,
  updated_at timestamptz not null default now()
);
create table if not exists public.result_private_notes ( -- 本人だけ
  result_id  uuid primary key references public.results(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  note       text not null,
  updated_at timestamptz not null default now()
);

-- ---------- 種目のひな形 ----------
create table if not exists public.workout_templates (
  id               uuid primary key default gen_random_uuid(),
  program_id       text references public.programs(id),   -- null = 全プログラム共通
  name             text not null,
  title            text not null,
  body             text not null,
  score_type       text not null
                   check (score_type in ('weight','time','reps','rounds_reps','completion')),
  scaling_levels   text[] not null default '{}',
  count_in_ranking boolean not null default true,
  created_by       uuid references public.profiles(id) on delete set null,
  created_at       timestamptz not null default now()
);

-- ---------- コーチ間の申し送り ----------
create table if not exists public.handovers (
  id         uuid primary key default gen_random_uuid(),
  body       text not null,
  author_id  uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  done       boolean not null default false,
  done_by    uuid references public.profiles(id) on delete set null,
  done_at    timestamptz
);
create index if not exists handovers_open_idx on public.handovers (done, created_at desc);

-- ---------- 権限変更の記録 ----------
create table if not exists public.role_changes (
  id          uuid primary key default gen_random_uuid(),
  target_id   uuid not null references public.profiles(id) on delete cascade,
  from_role   text not null,
  to_role     text not null,
  changed_by  uuid references public.profiles(id) on delete set null,
  changed_at  timestamptz not null default now()
);

-- ---------- 判定用の関数 ----------
-- security definer にするのは、profiles 自身の RLS と再帰しないため。
create or replace function public.is_coach() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles
                 where id = auth.uid() and role in ('coach','admin'));
$$;
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles
                 where id = auth.uid() and role = 'admin');
$$;

-- ---------- 登録時に profiles を自動で作る ----------
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id,
          coalesce(nullif(new.raw_user_meta_data->>'display_name',''),
                   split_part(new.email,'@',1)))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- 自分で自分の役割を変えられないようにする ----------
-- ポリシー側で同じテーブルを参照すると再帰しやすいので、トリガーで止める。
create or replace function public.guard_role_change() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception '役割を変えられるのは管理者だけです';
  end if;
  return new;
end $$;

drop trigger if exists profiles_guard_role on public.profiles;
create trigger profiles_guard_role before update on public.profiles
  for each row execute function public.guard_role_change();

-- ---------- updated_at の自動更新 ----------
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists results_touch on public.results;
create trigger results_touch before update on public.results
  for each row execute function public.touch_updated_at();

commit;

-- 04_seed_templates.sql
-- 貼り紙で毎週くり返している「型」。◯◯ の部分をコーチが埋める。
begin;

insert into public.workout_templates
  (program_id, name, title, body, score_type, scaling_levels, count_in_ranking)
values
  ('hyrox', $x$HYROX ストレングス（EMOM15）$x$, $x$Strength：EMOM15$x$, $x$EMOM15
・8 ◯◯
・10 ◯◯
・rest$x$, 'weight', '{}'::text[], false),
  ('hyrox', $x$HYROX ストレングス（2min × 8 rounds）$x$, $x$Strength：2 min × 8 rounds$x$, $x$2 min × 8 rounds（16 min）
・8 ◯◯
・8 ◯◯

※R1-3 : Build up / R4-8 : 80% 1RM$x$, 'weight', '{}'::text[], false),
  ('hyrox', $x$HYROX WOD（AMRAP25）$x$, $x$WOD：AMRAP25$x$, $x$AMRAP25
・600m RUN
・◯◯
・500m ROW
・◯◯

※Target 3 laps$x$, 'rounds_reps', '{}'::text[], true),
  ('hyrox', $x$HYROX WOD（For time / Team of 2）$x$, $x$WOD：For time / Team of 2$x$, $x$For time / Team of 2
・1000m Run(together)
・100 ◯◯
・◯◯

※CAP25
※Switch every 5-10 reps.$x$, 'time', '{}'::text[], true),
  ('crossfit', $x$CrossFit ストレングス（15min AMRAP）$x$, $x$Strength 15min AMRAP$x$, $x$15min AMRAP
10 ◯◯
10 ◯◯$x$, 'weight', ARRAY['RX','Scaled']::text[], false),
  ('crossfit', $x$CrossFit WOD（EMOM）$x$, $x$WOD：EMOM 15$x$, $x$EMOM 15
①◯◯
②◯◯
③◯◯$x$, 'completion', '{}'::text[], true),
  ('crossfit', $x$CrossFit WOD（AMRAP）$x$, $x$WOD：15min AMRAP$x$, $x$15min AMRAP
◯◯
◯◯
◯◯$x$, 'rounds_reps', ARRAY['RX','Scaled']::text[], true),
  ('cf40', $x$CF40（Team of 2 / For Time）$x$, $x$Team of 2：For Time$x$, $x$Team of 2 / For Time

◯◯
◯◯
◯◯$x$, 'time', ARRAY['RX','Scaled']::text[], true),
  ('cf40', $x$CF40（Team of 2 / AMRAP）$x$, $x$Team of 2：AMRAP◯$x$, $x$Team of 2
AMRAP◯
◯◯
◯◯$x$, 'rounds_reps', ARRAY['RX','Scaled']::text[], true),
  (null, $x$Recovery Day$x$, $x$Recovery Day$x$, $x$Recovery Day

※この日はクラスの設定がありません。$x$, 'completion', '{}'::text[], false);

commit;

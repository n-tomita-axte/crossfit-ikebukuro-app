-- 03_seed_programs_workouts.sql
-- CrossFit池袋 の実際の週次プログラム。
-- 出典：2026年9月にご提供いただいた貼り紙の画像6枚。
-- 会員と記録は含まない（作り物のため、本番には入れない）。
begin;

insert into public.programs (id, name, full_name, sort_order) values
  ('crossfit', $x$CrossFit$x$, $x$ROAD TO CROSSFITTER$x$, 1),
  ('hyrox', $x$HYROX$x$, $x$HYROX WEEKLY TRAINING PLAN$x$, 2),
  ('cf40', $x$CF40$x$, $x$2階 クロスフィット40$x$, 3)
on conflict (id) do update
  set name = excluded.name, full_name = excluded.full_name, sort_order = excluded.sort_order;

insert into public.workouts
  (program_id, date, title, body, score_type, scaling_levels,
   sort_order, published, count_in_ranking, coach_note, coach_note_updated_at)
values
  ('hyrox', '2026-08-31', $x$Strength：EMOM15$x$, $x$EMOM15
・8 Bent Over Row
・15 DB Calf Raise
・rest$x$, 'weight', '{}'::text[], 1, true, false, $x$TRAINING THEME
Our appreciation to Coach HIME. “Final HYROX”（D-147）$x$, '2026-08-31T08:30:00+09:00'),
  ('hyrox', '2026-08-31', $x$WOD：AMRAP25$x$, $x$AMRAP25
・600m RUN
・500m ROW
・20 Ring Row
・1min Plank Hold
・30 Wall Ball

※Aim for 3rd lap if possible.$x$, 'rounds_reps', '{}'::text[], 2, true, true, $x$$x$, null),
  ('hyrox', '2026-09-01', $x$Strength：EMOM15$x$, $x$EMOM15
・8 Deadlift
・10 Goblet Squat
・rest$x$, 'weight', '{}'::text[], 1, true, false, $x$TRAINING THEME
広背筋・下半身ビルド＆ハイテンポ有酸素（D-146）$x$, '2026-09-01T08:30:00+09:00'),
  ('hyrox', '2026-09-01', $x$WOD：AMRAP25$x$, $x$AMRAP25
・600m RUN
・20 Alt V-up
・500m ROW
・20 KB Swing
・20 Burpee Box Jump

※Aim for 3rd lap if possible.$x$, 'rounds_reps', '{}'::text[], 2, true, true, $x$$x$, null),
  ('hyrox', '2026-09-02', $x$Strength：EMOM15$x$, $x$EMOM15
・10 Gollira Row
・10 KB Swing
・rest$x$, 'weight', '{}'::text[], 1, true, false, $x$TRAINING THEME
握力・体幹・肩周りの局所筋耐性を通じてFarmers Carry強化（D-145）$x$, '2026-09-02T08:30:00+09:00'),
  ('hyrox', '2026-09-02', $x$WOD：AMRAP25$x$, $x$AMRAP25
・600m RUN
・2min DB Static Hold
・50 Flutter kick
・200m Farmers Carry
・30 HR Push-up

※Aim for 3rd lap if possible.$x$, 'rounds_reps', '{}'::text[], 2, true, true, $x$$x$, null),
  ('hyrox', '2026-09-03', $x$Strength：EMOM15$x$, $x$EMOM15
・8 Back Squat
・10 Bulgarian squat
・rest$x$, 'weight', '{}'::text[], 1, true, false, $x$TRAINING THEME
Sandbag Lunge を強化する（D-144）$x$, '2026-09-03T08:30:00+09:00'),
  ('hyrox', '2026-09-03', $x$WOD：AMRAP25$x$, $x$AMRAP25
・600m RUN
・24m Sandbag Lunge
・20 V-up, 20 R-Twist
・500m ROW
・20 KB Swing
・20 Burpee Box Jump

※Aim for 3rd lap if possible.
※R-Twist＝Russian twist$x$, 'rounds_reps', '{}'::text[], 2, true, true, $x$$x$, null),
  ('hyrox', '2026-09-04', $x$Strength：EMOM15$x$, $x$EMOM15
・8 Back Squat
・8 DB Thruster
・rest$x$, 'weight', '{}'::text[], 1, true, false, $x$TRAINING THEME
Burpee Board Jumpを強化する（D-143）$x$, '2026-09-04T08:30:00+09:00'),
  ('hyrox', '2026-09-04', $x$WOD：For time / Team of 2$x$, $x$For time / Team of 2
・1000m Run(together)
・100 MT Push-up
・600m Row
・100 V-up
・100 Burpee Box Jump

※CAP25
※Switch after 5 to 10 reps each other.$x$, 'time', '{}'::text[], 2, true, true, $x$$x$, null),
  ('hyrox', '2026-09-05', $x$Strength：EMOM12$x$, $x$EMOM12
・10 KB Swing
・10 KB Gorilla Row
・rest$x$, 'weight', '{}'::text[], 1, true, false, $x$TRAINING THEME
ペアで乗り越える高強度トレ（D-142）$x$, '2026-09-05T08:30:00+09:00'),
  ('hyrox', '2026-09-05', $x$WOD：AMRAP8 × 4 Rounds / Team of 2$x$, $x$AMRAP8 × 4 Rounds（Rest remaining time）/ Team of 2
Buy-in : 600m Run together before each round

R1 : 50 DB Snatch
R2 : 1000m Row
R3 : 50 DB Thruster
R4 : 80 Wall Ball

※Switch every 5-10 reps as needed.$x$, 'reps', '{}'::text[], 2, true, true, $x$$x$, null),
  ('hyrox', '2026-09-06', $x$Strength：EMOM15$x$, $x$EMOM15
・8 Back Squat
・10 Devils Press
・rest$x$, 'weight', '{}'::text[], 1, true, false, $x$TRAINING THEME
ラン＆WALLBALL強化のためのスクワット動作（D-141）$x$, '2026-09-06T08:30:00+09:00'),
  ('hyrox', '2026-09-06', $x$WOD：For time / Team of 2$x$, $x$For time / Team of 2
・600m Run(together)
・100 HR Push-up
・100 DB Thruster
・100 V-up
・100 Wall Ball

※CAP25
※Switch after 5 to 10 reps each other.$x$, 'time', '{}'::text[], 2, true, true, $x$$x$, null),
  ('hyrox', '2026-09-07', $x$Strength：2 min × 8 rounds$x$, $x$2 min × 8 rounds（16 min）
・8 Deadlift
・8 KB Swing

※R1-3 : Build up / R4-8 : 80% 1RM$x$, 'weight', '{}'::text[], 1, true, false, $x$TRAINING THEME
握力・体幹・肩周りの局所筋耐性を通じてFarmers Carry強化（D-140）$x$, '2026-09-07T08:30:00+09:00'),
  ('hyrox', '2026-09-07', $x$WOD：AMRAP25$x$, $x$AMRAP25
・600m RUN
・2min KB Static Hold
・50 Flutter kick
・100 steps KB March
・30 HR Push-up

※Target 3 laps$x$, 'rounds_reps', '{}'::text[], 2, true, true, $x$$x$, null),
  ('hyrox', '2026-09-08', $x$Strength：2 min × 8 rounds$x$, $x$2 min × 8 rounds（16 min）
・8 Bent Over Row
・8 DB Thruster

※R1-3 : Build up / R4-8 : 80% 1RM$x$, 'weight', '{}'::text[], 1, true, false, $x$TRAINING THEME
Burpee Board Jumpを強化する（D-139）$x$, '2026-09-08T08:30:00+09:00'),
  ('hyrox', '2026-09-08', $x$WOD：For time / Team of 2$x$, $x$For time / Team of 2
・1000m Run(together)
・100 MT Push-up
・100 Ring Row
・100 V-up
・100 Burpee to Plate

※MT＝Mike Tyson
※Switch every 5-10 reps.$x$, 'time', '{}'::text[], 2, true, true, $x$$x$, null),
  ('hyrox', '2026-09-09', $x$Strength：2 min × 8 rounds$x$, $x$2 min × 8 rounds（16 min）
・8 Back Squat
・8 DB Press

※R1-3 : Build up / R4-8 : 80% 1RM$x$, 'weight', '{}'::text[], 1, true, false, $x$TRAINING THEME
Sandbag Lunge を強化する（D-138）$x$, '2026-09-09T08:30:00+09:00'),
  ('hyrox', '2026-09-09', $x$WOD：AMRAP25$x$, $x$AMRAP25
・600m RUN
・24m Sandbag Lunge
・40 Alt V-up
・500m ROW
・20 KB Swing
・30 Stationary Lunges

※Target 3 laps$x$, 'rounds_reps', '{}'::text[], 2, true, true, $x$$x$, null),
  ('hyrox', '2026-09-10', $x$Strength：2 min × 8 rounds$x$, $x$2 min × 8 rounds（16 min）
・8 Dead Lift
・8 Devils Press

※R1-3 : Build up / R4-8 : 80% 1RM$x$, 'weight', '{}'::text[], 1, true, false, $x$TRAINING THEME
差が出る種目と乳酸耐性ラン（D-137）$x$, '2026-09-10T08:30:00+09:00'),
  ('hyrox', '2026-09-10', $x$WOD：For time / Team of 2$x$, $x$For time / Team of 2
・1000m Run(together)
・100 Burpee to Plate
・100 HR Push-up
・1000m Run(together)
・100m Sandbag Lunge

※CAP25$x$, 'time', '{}'::text[], 2, true, true, $x$$x$, null),
  ('hyrox', '2026-09-11', $x$Strength：2 min × 8 rounds$x$, $x$2 min × 8 rounds（16 min）
・8 DB Push Press
・15 Calf Raise

※R1-3 : Build up / R4-8 : 80% 1RM$x$, 'weight', '{}'::text[], 1, true, false, $x$TRAINING THEME
Wallball を強化する（D-136）$x$, '2026-09-11T08:30:00+09:00'),
  ('hyrox', '2026-09-11', $x$WOD：AMRAP25$x$, $x$AMRAP25
・50 Shoulder Tap
・40 Gorilla Row
・30 Burpee(Sprint)
・20 Wall Ball
・600m RUN

※Target 4 laps$x$, 'rounds_reps', '{}'::text[], 2, true, true, $x$$x$, null),
  ('hyrox', '2026-09-12', $x$WOD：AMRAP25$x$, $x$AMRAP25
・1 Burpee
・2 Air Squat
・3 Push-up
・4 Reverse Lunges
・5 DB Thruster
・10 Wall Ball
・200m ROW

※Keep moving repeatedly until time-up$x$, 'rounds_reps', '{}'::text[], 1, true, true, $x$TRAINING THEME
有酸素運動と広背筋を鍛える（D-135）$x$, '2026-09-12T08:30:00+09:00'),
  ('hyrox', '2026-09-12', $x$Strength：2 min × 8 rounds$x$, $x$2 min × 8 rounds（16 min）
・8 Back Squat
・8 DB Snatch

※R1-3 : Build up / R4-8 : 80% 1RM$x$, 'weight', '{}'::text[], 2, true, false, $x$$x$, null),
  ('hyrox', '2026-09-13', $x$Strength：2 min × 8 rounds$x$, $x$2 min × 8 rounds（16 min）
・8 DB Push Press
・8 DB Goblet Squat

※R1-3 : Build up / R4-8 : 80% 1RM$x$, 'weight', '{}'::text[], 1, true, false, $x$TRAINING THEME
【Basic向け】乳酸耐性を身に着ける有酸素運動（D-134）$x$, '2026-09-13T08:30:00+09:00'),
  ('hyrox', '2026-09-13', $x$WOD：AMRAP25$x$, $x$AMRAP25
・600m Run
・30 Stationary Lunges
・30 Burpee to Plate
・500m Row
・30 Wall Ball$x$, 'rounds_reps', '{}'::text[], 2, true, true, $x$$x$, null),
  ('crossfit', '2026-09-07', $x$"Pull Strength" 15min AMRAP$x$, $x$15min AMRAP
10 Plate Straight Arm Bent Over row
10 DB Bent Over Row
20 sec Box L-sit hold$x$, 'weight', ARRAY['RX','Scaled']::text[], 1, true, false, $x$9/7 - 10/4 Target：強靭な足腰と体幹
Strength：①Deadlifts PR + 2.5KG　②Bent Over row 背中の筋肉目覚め　③Snatch PR + 2KG$x$, '2026-09-07T08:30:00+09:00'),
  ('crossfit', '2026-09-07', $x$WOD：15 min AMRAP / Team of 2$x$, $x$15 min AMRAP / Team of 2
50 Burpee
30 OH squats$x$, 'rounds_reps', ARRAY['RX','Scaled']::text[], 2, true, true, $x$$x$, null),
  ('crossfit', '2026-09-08', $x$Weight Lifting 15min AMRAP$x$, $x$15min AMRAP
P1 : Snatch complex
　3 High Hang Dip Power snatch
　3 OH Squats
P2 : 10 Banded Snatch Sots Press$x$, 'weight', ARRAY['RX','Scaled']::text[], 1, true, false, $x$9/7 - 10/4 Target：強靭な足腰と体幹
Strength：①Deadlifts PR + 2.5KG　②Bent Over row 背中の筋肉目覚め　③Snatch PR + 2KG$x$, '2026-09-08T08:30:00+09:00'),
  ('crossfit', '2026-09-08', $x$WOD：EMOM 15$x$, $x$EMOM 15
①50 Double Under
②15 Plate Sit up
③1set Max rep St Pullup$x$, 'completion', '{}'::text[], 2, true, true, $x$$x$, null),
  ('crossfit', '2026-09-09', $x$Strength 15min AMRAP$x$, $x$15min AMRAP
10 Deadlifts

P1,2 20 sec Nordic hamstring$x$, 'weight', ARRAY['RX','Scaled']::text[], 1, true, false, $x$9/7 - 10/4 Target：強靭な足腰と体幹
Strength：①Deadlifts PR + 2.5KG　②Bent Over row 背中の筋肉目覚め　③Snatch PR + 2KG$x$, '2026-09-09T08:30:00+09:00'),
  ('crossfit', '2026-09-09', $x$WOD：Every 4min × 5 rounds$x$, $x$Every 4min × 5 rounds
Rounds 1,3,5 : 1000 m row
Rounds 2,4 : 30 kipping HSPU$x$, 'completion', '{}'::text[], 2, true, true, $x$$x$, null),
  ('crossfit', '2026-09-10', $x$BARBELL SKILL$x$, $x$Deadlift → Low catch$x$, 'completion', '{}'::text[], 1, true, true, $x$9/7 - 10/4 Target：強靭な足腰と体幹
Strength：①Deadlifts PR + 2.5KG　②Bent Over row 背中の筋肉目覚め　③Snatch PR + 2KG$x$, '2026-09-10T08:30:00+09:00'),
  ('crossfit', '2026-09-11', $x$WOD：EMOM 35$x$, $x$EMOM 35
1 : 10 DB hang Squat Clean
2 : 10 DB Shoulder Press
3 : 15 Box st leg raise
4 : 8/8 KB Bulgarian Squats
5 : Rest$x$, 'completion', '{}'::text[], 1, true, true, $x$9/7 - 10/4 Target：強靭な足腰と体幹
Strength：①Deadlifts PR + 2.5KG　②Bent Over row 背中の筋肉目覚め　③Snatch PR + 2KG$x$, '2026-09-11T08:30:00+09:00'),
  ('crossfit', '2026-09-12', $x$Strength 15min AMRAP$x$, $x$15min AMRAP
5 Dead lifts
20/20 nordic hamstring$x$, 'weight', ARRAY['RX','Scaled']::text[], 1, true, false, $x$9/7 - 10/4 Target：強靭な足腰と体幹
Strength：①Deadlifts PR + 2.5KG　②Bent Over row 背中の筋肉目覚め　③Snatch PR + 2KG$x$, '2026-09-12T08:30:00+09:00'),
  ('crossfit', '2026-09-12', $x$WOD：15min AMRAP$x$, $x$15min AMRAP
50-40-30-20-10
Knee raise
Box jump
Push up$x$, 'rounds_reps', ARRAY['RX','Scaled']::text[], 2, true, true, $x$$x$, null),
  ('crossfit', '2026-09-13', $x$Strength 15 min AMRAP$x$, $x$15 min AMRAP
10 Band Bent Over row
10 DB bent over row
10 Box L-sit hold$x$, 'weight', ARRAY['RX','Scaled']::text[], 1, true, false, $x$9/7 - 10/4 Target：強靭な足腰と体幹
Strength：①Deadlifts PR + 2.5KG　②Bent Over row 背中の筋肉目覚め　③Snatch PR + 2KG$x$, '2026-09-13T08:30:00+09:00'),
  ('crossfit', '2026-09-13', $x$WOD：3 Rounds For time$x$, $x$3 Rounds For time
500 m Row
50 DB Snatch
10 wall walk$x$, 'time', ARRAY['RX','Scaled']::text[], 2, true, true, $x$$x$, null),
  ('crossfit', '2026-09-14', $x$"Pull Strength" 15 min AMRAP$x$, $x$15 min AMRAP
8 Plate straight arm Bent Over row
8 BB Bent Over Row
8 St Pullup
20 sec Hollow hold$x$, 'weight', ARRAY['RX','Scaled']::text[], 1, true, false, $x$9/7 - 10/4 Target：強靭な足腰と体幹
Strength：①Deadlifts PR + 2.5KG　②Bent Over row 背中の筋肉目覚め　③Snatch PR + 2KG$x$, '2026-09-14T08:30:00+09:00'),
  ('crossfit', '2026-09-14', $x$WOD：3min × 5 rounds$x$, $x$3min × 5 rounds（1:30 on 1:30 off）
12/15 Cal Row
30 DU
-Max rep Wall walk$x$, 'reps', ARRAY['RX','Scaled']::text[], 2, true, true, $x$$x$, null),
  ('crossfit', '2026-09-15', $x$Weight Lifting 15 min AMRAP$x$, $x$15 min AMRAP
P1 : Snatch complex
　2 Power snatch
　1 OH Squats
P2 : Loo raise$x$, 'weight', ARRAY['RX','Scaled']::text[], 1, true, false, $x$9/7 - 10/4 Target：強靭な足腰と体幹
Strength：①Deadlifts PR + 2.5KG　②Bent Over row 背中の筋肉目覚め　③Snatch PR + 2KG$x$, '2026-09-15T08:30:00+09:00'),
  ('crossfit', '2026-09-15', $x$WOD：Death by DB Thruster + V-up$x$, $x$Death by DB Thruster + V-up
Min1 : 1 Thruster + 2 V-up
Min2 : 2 Thruster + 4 V-up
Min3 : 3 Thruster + 6 V-up

TC 15 min$x$, 'reps', ARRAY['RX','Scaled']::text[], 2, true, true, $x$$x$, null),
  ('crossfit', '2026-09-16', $x$Strength 15min AMRAP$x$, $x$15min AMRAP
P1 : 5 Deadlifts
P2 : 20 sec child pose + 3/3 single leg jump$x$, 'weight', ARRAY['RX','Scaled']::text[], 1, true, false, $x$9/7 - 10/4 Target：強靭な足腰と体幹
Strength：①Deadlifts PR + 2.5KG　②Bent Over row 背中の筋肉目覚め　③Snatch PR + 2KG$x$, '2026-09-16T08:30:00+09:00'),
  ('crossfit', '2026-09-16', $x$WOD：1:30 on 1:30 off × 5 Rounds$x$, $x$1:30 on 1:30 off × 5 Rounds
5 clean + 5 Shoulder to OH
10 Tose to bar
-Max sec weghted palnk hold$x$, 'reps', ARRAY['RX','Scaled']::text[], 2, true, true, $x$$x$, null),
  ('crossfit', '2026-09-17', $x$BARBELL SKILL$x$, $x$REST$x$, 'completion', '{}'::text[], 1, true, true, $x$9/7 - 10/4 Target：強靭な足腰と体幹
Strength：①Deadlifts PR + 2.5KG　②Bent Over row 背中の筋肉目覚め　③Snatch PR + 2KG$x$, '2026-09-17T08:30:00+09:00'),
  ('crossfit', '2026-09-18', $x$Bulgarian Squats Every 4 min × 4 rounds$x$, $x$Every 4 min × 4 rounds
12/12 rep Bulgarian Squats
5-10 St HSPU / Push up$x$, 'weight', ARRAY['RX','Scaled']::text[], 1, true, false, $x$9/7 - 10/4 Target：強靭な足腰と体幹
Strength：①Deadlifts PR + 2.5KG　②Bent Over row 背中の筋肉目覚め　③Snatch PR + 2KG$x$, '2026-09-18T08:30:00+09:00'),
  ('crossfit', '2026-09-18', $x$WOD：For time（TC 16min / Team of 2）$x$, $x$For time（TC 16min / Team of 2）
100 Bent over row
100 DB Push press
100 DB OH Lunge
100 wall ball$x$, 'time', ARRAY['RX','Scaled']::text[], 2, true, true, $x$$x$, null),
  ('crossfit', '2026-09-19', $x$Strength 15min AMRAP$x$, $x$15min AMRAP
10 Band Bent Over row
10 DB bent over row
10 Box L-sit hold$x$, 'weight', ARRAY['RX','Scaled']::text[], 1, false, false, $x$9/7 - 10/4 Target：強靭な足腰と体幹
Strength：①Deadlifts PR + 2.5KG　②Bent Over row 背中の筋肉目覚め　③Snatch PR + 2KG$x$, '2026-09-19T08:30:00+09:00'),
  ('crossfit', '2026-09-19', $x$WOD：Every 5 min × 3 rounds$x$, $x$Every 5 min × 3 rounds
20 Burpee box jump
30 DB Push press
40 Knee raise$x$, 'completion', '{}'::text[], 2, false, true, $x$$x$, null),
  ('crossfit', '2026-09-20', $x$Strength 15 min AMRAP$x$, $x$15 min AMRAP
5 Dead lifts
20/20 nordic hamstring$x$, 'weight', ARRAY['RX','Scaled']::text[], 1, false, false, $x$9/7 - 10/4 Target：強靭な足腰と体幹
Strength：①Deadlifts PR + 2.5KG　②Bent Over row 背中の筋肉目覚め　③Snatch PR + 2KG$x$, '2026-09-20T08:30:00+09:00'),
  ('crossfit', '2026-09-20', $x$WOD：Every 3:00 × 5 rounds$x$, $x$Every 3:00 × 5 rounds
10 DB hang clean
10 DB Dead lifts
10 Push up
-max cal row（until 2:00）$x$, 'reps', ARRAY['RX','Scaled']::text[], 2, false, true, $x$$x$, null),
  ('cf40', '2026-09-07', $x$Team of 2：2:00 × 10 rounds$x$, $x$Team of 2
2:00 × 10rounds
10 DB Strict Press
Max mater Row
※Alternate rounds with your partner.

Score : Total cal$x$, 'reps', ARRAY['RX','Scaled']::text[], 1, true, true, $x$$x$, null),
  ('cf40', '2026-09-08', $x$Team of 2：For Time$x$, $x$Team of 2 / For Time
600m Together Run
42 KB Swing
21 Synchro KB Goblet Squat
30 KB Swing
15 Synchro KB Goblet Squat
18 KB Swing
9 Synchro KB Goblet Squat
600m Together Run$x$, 'time', ARRAY['RX','Scaled']::text[], 1, true, true, $x$$x$, null),
  ('cf40', '2026-09-09', $x$Team of 2：6:00 × 3 rounds$x$, $x$Team of 2
6:00 × 3rounds
15-12-9
Synchro DB Hang Clean
Synchro Burpee Over DB
※Unbroken & same time all rounds.$x$, 'completion', '{}'::text[], 1, true, true, $x$$x$, null),
  ('cf40', '2026-09-10', $x$Recovery Day$x$, $x$Recovery Day

※この日はクラスの設定がありません。$x$, 'completion', '{}'::text[], 1, true, true, $x$$x$, null),
  ('cf40', '2026-09-11', $x$TEAM ANDI$x$, $x$TEAM ANDI
Team of 2
100 DB Hang Snatch
100 DB Push Press
100 DB Deadlift
100 DB Front Squat$x$, 'time', ARRAY['RX','Scaled']::text[], 1, true, true, $x$$x$, null),
  ('cf40', '2026-09-12', $x$Team of 2：AMRAP16$x$, $x$Team of 2
AMRAP16
2 Synchro DB Devils Press
10 Strict Ring Pull-up
※ +1 DB Devils Press every rounds.$x$, 'rounds_reps', ARRAY['RX','Scaled']::text[], 1, true, true, $x$$x$, null),
  ('cf40', '2026-09-13', $x$Team of 2：AMRAP21$x$, $x$Team of 2
AMRAP21
20 cal Row
40 Ring Strict Knee Raise
60 Double Under
※Every 3:00, Starting at :00, perform 10 Synchro reverse lunges.$x$, 'rounds_reps', ARRAY['RX','Scaled']::text[], 1, true, true, $x$$x$, null),
  ('cf40', '2026-09-14', $x$BURPEE GRACE$x$, $x$BURPEE GRACE
Team of 2 / For Time

30 Synchro DB Clean&Jerk

※Every 5 C&J perform
　10 Synchro Burpee over DB.$x$, 'time', ARRAY['RX','Scaled']::text[], 1, true, true, $x$$x$, null),
  ('cf40', '2026-09-15', $x$Team of 2：For Time$x$, $x$Team of 2 / For Time

3 rounds
15 Synchro DB Thruster
30 Ring Pull-up
400m Together Run$x$, 'time', ARRAY['RX','Scaled']::text[], 1, true, true, $x$$x$, null),
  ('cf40', '2026-09-16', $x$Team of 2：AMRAP16$x$, $x$Team of 2
AMRAP16

20 Synchro AbMat Sit-up
10/15 cal Row or Air Squat$x$, 'rounds_reps', ARRAY['RX','Scaled']::text[], 1, true, true, $x$$x$, null),
  ('cf40', '2026-09-17', $x$Recovery Day$x$, $x$Recovery Day

※この日はクラスの設定がありません。$x$, 'completion', '{}'::text[], 1, true, true, $x$$x$, null),
  ('cf40', '2026-09-18', $x$Team of 2：For Time$x$, $x$Team of 2 / For Time

400m Together Run
20-16-12-8-4
DB Bench Press$x$, 'time', ARRAY['RX','Scaled']::text[], 1, true, true, $x$$x$, null),
  ('cf40', '2026-09-19', $x$Team of 2：AMRAP20 Max cal Row$x$, $x$Team of 2
AMRAP20
Max cal Row

【non-working partner】
0:00〜5:00 → Hold Plank
5:00〜10:00 → Hanging Ring
10:00〜15:00 → Hold Plank
15:00〜20:00 → Hanging Ring$x$, 'reps', ARRAY['RX','Scaled']::text[], 1, false, true, $x$$x$, null),
  ('cf40', '2026-09-20', $x$Recovery Day$x$, $x$Recovery Day

※この日はクラスの設定がありません。$x$, 'completion', '{}'::text[], 1, false, true, $x$$x$, null);

commit;

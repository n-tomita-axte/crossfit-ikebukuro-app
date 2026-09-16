# CrossFit池袋 会員向けアプリ

Next.js 14 (App Router) + Supabase。3つのプログラム（CrossFit / HYROX / CF40）の
日々のWODを会員が見て、結果を記録し、コーチが入稿・管理するアプリです。

## 権限モデル

`profiles.role` で3種類。RLS（Row Level Security）がすべての実データアクセスを守っているので、
画面側のガードが漏れていてもDB側で弾かれます。

- **member（会員）**: 公開済みのWODの閲覧、自分の記録・メモの読み書き、結果ボードの閲覧
- **coach（コーチ）**: 上記に加えてWODの下書き作成・公開、コーチ間の申し送り、
  会員のコーチ宛メモの閲覧（本人専用メモは見えません）
- **admin（管理者）**: 上記すべて + 会員の役割変更（`role_changes`に監査ログが残ります）

メモは2種類に分かれています（`01_schema.sql`のコメントの通り、テーブルを分けているのは
「見せる相手が違うメモを同じ行に置くと、点数を見せるために行ごと開放したときにメモも一緒に漏れる」ため）。

- `result_coach_notes` … 本人 + コーチ・管理者が見られる
- `result_private_notes` … 本人だけ

## 1. Supabaseのセットアップ

1. https://supabase.com/dashboard で新規プロジェクトを作成
2. **SQL Editor** で、`supabase/`内のファイルを **番号順に** そのまま実行してください
   1. `01_schema.sql` … テーブル・関数・トリガー
   2. `02_rls.sql` … Row Level Security ポリシー
   3. `03_seed_programs_workouts.sql` … プログラムと実際の週次WOD（2026年9月にご提供いただいた実際の貼り紙6枚から起こした本番データです。会員・記録は含みません）
   4. `04_seed_templates.sql` … コーチが使う「型」のひな形
   5. `05_admin_functions.sql` … **今回追加したファイル**。`role_changes`監査ログに実際に書き込む処理が
      元のSQLに無かったため、「役割変更」と「監査ログ記録」を1つの関数にまとめて追加しました
   6. `06_fix_grants.sql` … **`drop schema public cascade`を実行した場合は必須**。詳細は下記「トラブルシューティング」参照
3. **Authentication > Providers** で `Email` が有効になっていることを確認
4. **マジックリンクログインを使う場合は必須**: **Authentication > URL Configuration** を開き、
   `Redirect URLs` に以下を追加してください(本番URL・ローカル開発URLの両方)
   ```
   https://<あなたのVercelドメイン>/auth/callback
   http://localhost:3000/auth/callback
   ```
   これを登録していないと、メールのリンクをタップしてもログインが完了せず、
   `/login?error=auth`(リンクが無効というエラー)に戻されてしまいます。
5. **Project Settings > API** から `Project URL` と `anon public` キーをコピー

### 最初の管理者を作る（重要）

`admin_set_role`関数は「管理者だけが呼べる」ため、最初の管理者はSQL Editorから直接作る必要があります。
アプリでサインアップした後、そのアカウントのユーザーIDを確認して実行してください。

`profiles`テーブルには「`role`列の変更は管理者にしか許可しない」という`guard_role_change`トリガーが
付いています。SQL Editorから実行する場合は「ログイン中のユーザー」が存在しないため、このトリガーに
ブロックされてしまいます。**最初の1人だけ**、トリガーを一時的に止めてから更新してください。

```sql
-- Authentication > Users でIDを確認するか、以下で表示名から検索
select id, display_name from public.profiles where display_name = 'あなたの表示名';

alter table public.profiles disable trigger profiles_guard_role;
update public.profiles set role = 'admin' where id = 'コピーしたUUID';
alter table public.profiles enable trigger profiles_guard_role;
```

2人目以降の役割変更は、アプリの`/admin`画面（`admin_set_role`関数経由）で行ってください。
そちらは`role_changes`に監査ログも残ります。

## 2. ローカルで動かす

```bash
npm install
cp .env.local.example .env.local
# .env.local に Supabase の URL と anon key を貼り付け
npm run dev
```

## 3. Vercelにデプロイして公開URLを発行する

1. GitHubにpush
2. https://vercel.com/new でリポジトリをimport
3. Environment Variables に `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` を設定
4. Deploy → `https://xxxx.vercel.app` のようなURLが発行されます

## トラブルシューティング

### ログインはできるのに、WOD一覧やプロフィールが何も表示されない

ブラウザの開発者ツールでエラーが出ないまま、ボードのプログラムタブが空になったり、
`/settings`の表示名が空欄になったりする場合、**Postgresの権限(GRANT)が欠けている**可能性が高いです。

これは、`profiles`テーブルなどの衝突を解消するために

```sql
drop schema public cascade;
create schema public;
```

を実行した場合に起こります。Supabaseがプロジェクト作成時に自動設定している
「`authenticated`ロールが各テーブルを読み書きできる」という土台の権限(GRANT)が、
このコマンドで一緒に失われてしまうためです。RLS（`02_rls.sql`）は「どの行を見せるか」を
制御するだけで、その前提となる「そのテーブルに触れてよいか」という権限は別に必要です。

**対処**: `supabase/06_fix_grants.sql`をSQL Editorで実行してください。
`drop schema public cascade`を実行していない場合は、このファイルは不要です
（通常のSupabaseプロジェクトには最初から必要な権限が設定されています）。

見分け方: ブラウザの開発者ツールではなく、アプリのコード側で一時的にエラー内容を
画面に出して確認すると、`permission denied for table xxx`という形でこのエラーが見えます。



- `/login` … ログイン。既定はマジックリンク（メールアドレスだけでログインリンクを送信）、
  「パスワードでログインする」で従来のメール+パスワード方式にも切り替え可能
- `/auth/callback` … マジックリンクのメール内リンクをタップした後、セッションを確立してから
  `/board`へ転送するルート（画面としては表示されません）
- `/board` … 会員向け。プログラムタブ + 日付ナビ + その日のWOD一覧
- `/w/[id]` … WOD詳細。記録入力（スコアタイプに応じて入力欄が変化）、コーチへのメモ、自分だけのメモ、結果ボード（ランキング、男女フィルタ）
- `/settings` … 表示名・性別区分・既定のスケーリングの設定
- `/coach` … コーチ・管理者向け。プログラム/日付ごとのWOD一覧（下書き含む）、新規作成
- `/coach/workouts/[id]` … WOD作成・編集（`id=new`で新規、ひな形から読み込み可、削除も可能）
- `/coach/handovers` … コーチ間の申し送り（会員には存在ごと見えません）
- `/admin` … 管理者向け。会員の役割変更

### コーチによる代理記録

`/w/[id]`のWOD詳細画面に、コーチ・管理者だけに見える「コーチ用：会員の代わりに記録する」ボタンがあります。
`02_rls.sql`の`results_coach_write`ポリシーに基づく機能です。

- 会員を選んでスコア・スケーリングを代理入力できます
- **コーチへのメモ・自分だけのメモは代理入力できません**。`result_coach_notes`・`result_private_notes`の
  書き込みポリシーが `user_id = auth.uid()`（本人のみ）のため、コーチが他人になりすまして書くことはDB側で拒否されます
  （意図的な設計と判断し、そのままにしています）

### WODの削除

`/coach/workouts/[id]`の編集画面下部から削除できます。`02_rls.sql`の`workouts_delete`ポリシー
（管理者、または登録した本人のみ削除可）に従い、条件を満たさない場合はボタン自体を表示しません。

## スコアタイプごとの入力

| score_type | 入力 | 保存先 |
|---|---|---|
| weight | 重量(kg) | `score_value` |
| reps | レップ数など | `score_value` |
| time | 分:秒（例 `12:34`） | `score_value`（秒に変換） |
| rounds_reps | ラウンド + 追加レップ | `score_value` + `score_secondary` |
| completion | 完了/未完了 | `completed` |

結果ボードは `count_in_ranking = true` のWODだけに表示されます
（重量系の種目は「自己ベストの◯%」で個人差が出るため、既定でランキング対象外）。

## 未確定・要確認の点（推測で仮実装しています）

以下は SQL からは断定できなかったため、こちらで仮の仕様にして進めています。
実際の運用に合わせて調整が必要であれば教えてください。

1. **結果ボードの男女分け**: `profiles.gender_division` があったため、
   「全体・男性・女性」のタブで絞り込む仕様にしました。分けない方がよい場合はご連絡ください。
2. **表示名・性別区分の入力タイミング**: サインアップ時の入力フォームは作らず、
   ログイン後に `/settings` でいつでも設定・変更できる形にしました。
3. **WODの公開タイミング**: 「朝◯時に自動公開」のような予約機能はなく、
   コーチが手動で「公開する」にチェックを入れた時点で会員に見えるようにしています。
4. **申し送りの通知**: 新規追加や対応済みになったときの通知（メール/プッシュ）は未実装です。

以下2つは検討した上で、今回は見送りました（`01〜05`のSQLに根拠が無く、新しい仕組みが必要なため）。
必要になれば改めて実装します。

- WODの予約公開（時刻指定で自動公開）— pg_cronやVercel Cronなど新しい仕組みが必要
- 公開時のメール/プッシュ通知 — 新しい仕組みが必要

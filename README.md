# ゲーム感想コミュニティ MVP

Next.js + TypeScript + Tailwind CSS + Supabase で作る、初心者〜ライト層向けゲーム感想コミュニティのMVPです。

## 技術スタック

- Next.js (App Router)
- TypeScript (strict)
- Tailwind CSS
- Supabase (Auth / DB)

## 画面一覧

- `/` トップページ
- `/games` ゲーム一覧
- `/games/[slug]` ゲーム詳細コミュニティ
- `/posts/[id]` 投稿詳細
- `/create` 投稿作成
- `/login` ログイン
- `/signup` 新規登録
- `/profile/[id]` プロフィール
- `/rules` 利用ルール

## セットアップ

1. 依存関係をインストール

```bash
npm install
```

2. 環境変数を設定

`.env.example` をコピーして `.env.local` を作成し、Supabaseの値を入れてください。

```bash
cp .env.example .env.local
```

3. Supabase SQL を実行

- `supabase/schema.sql`
- `supabase/seed.sql`
- （既存環境の追加変更時）`supabase/admin_migration.sql`

Supabase Dashboard の SQL Editor で上から順に実行します。

4. 開発サーバー起動

```bash
npm run dev
```

## 最低限のデータ構成

- `users`
- `games`
- `categories`
- `posts`
- `comments`
- `reactions`
- `reports`

## 主要機能

- メールアドレス認証（サインアップ/ログイン）
- ゲーム一覧とゲーム別コミュニティ閲覧
- 投稿作成・一覧・詳細
- コメント投稿
- 複数種類リアクション
- ネタバレ表示切替UI
- プロフィール表示/編集
- 通報の最小実装（保存のみ）

## 管理者機能（最小）

- `/admin` と `/admin/reports` は admin ユーザーのみアクセス可能です。
- 最初の管理者は SQL で `users.role = 'admin'` を付与してください。

```sql
update public.users
set role = 'admin'
where email = 'your-admin@example.com';
```

## 補足

- ゲスト閲覧は可能です。
- 投稿/コメント/リアクション/通報/プロフィール編集はログイン必須です。
- 通報管理画面はMVP対象外です。

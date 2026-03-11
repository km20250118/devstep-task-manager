# TaskFlow — タスク管理 Web アプリ

## 🚀 デプロイURL
<https://devstep-task-manager-seven.vercel.app>

個人用タスク管理 Web アプリケーション。日々のタスクを記録し、作成・編集・削除・完了管理ができます。

---

## 技術スタック

| 分類 | 技術 |
|------|------|
| フレームワーク | Next.js 16 (App Router) |
| 言語 | TypeScript |
| 認証 / DB | Supabase |
| スタイリング | Tailwind CSS |
| デプロイ | Vercel |

---

## 機能一覧

### Stage 1 (Week 1) ✅
- メール / パスワードによる新規登録
- ログイン・ログアウト
- 認証状態の管理（セッション）
- 未ログイン時は `/login` へリダイレクト
- ログイン成功後は `/tasks` へリダイレクト
- Vercel デプロイ

### Stage 1 (Week 2) ✅
- タスクの作成（タイトル・詳細・期限日）
- タスクの一覧表示（作成日時の降順）
- タスクの編集
- タスクの完了・未完了の切り替え
- タスクの削除
- タスクのフィルタリング（すべて・未完了・完了済み・期限超過）
- 統計表示（合計・完了数・期限超過数）
- 入力バリデーション（タイトル100文字以内・詳細500文字以内）
- ログインユーザーのタスクのみ表示・操作できる

---

## 画面一覧

| 画面名 | URL | 備考 |
|--------|-----|------|
| ログイン画面 | `/login` | 未ログイン時のデフォルト遷移先 |
| 新規登録画面 | `/signup` | — |
| タスク一覧画面 | `/tasks` | ログイン後のデフォルト遷移先 |

---

## セットアップ手順

### 1. リポジトリをクローン

```bash
git clone https://github.com/YOUR_USERNAME/devstep-task-manager.git
cd devstep-task-manager
```

### 2. 依存パッケージをインストール

```bash
npm install
```

### 3. Supabase プロジェクトを作成

1. [Supabase](https://supabase.com) にアクセスし、新規プロジェクトを作成
2. **Project Settings > API** から以下の値を取得
   - `Project URL`
   - `anon public` キー

### 4. 環境変数を設定

`.env.local.example` をコピーして `.env.local` を作成し、取得した値を設定します。

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 5. Supabase の認証設定

Supabase ダッシュボードの **Authentication > URL Configuration** で以下を設定：

- **Site URL**: `http://localhost:3000`（開発環境）または Vercel のデプロイ URL
- **Redirect URLs**: `http://localhost:3000/auth/callback`

### 6. Supabase のデータベース設定

Supabase ダッシュボードの **SQL Editor** で以下を実行し、`tasks` テーブルを作成します。

```sql
create table tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  detail text,
  due_date date,
  completed boolean default false not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- RLS を有効化
alter table tasks enable row level security;

-- 自分のタスクのみ操作可能にするポリシー
create policy "Users can manage their own tasks"
  on tasks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

### 7. 開発サーバーを起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

---

## Vercel へのデプロイ

### 1. Vercel と GitHub を連携

1. [Vercel](https://vercel.com) にアクセスし、GitHubアカウントでログイン
2. 「New Project」からリポジトリをインポート

### 2. 環境変数を設定

Vercel のプロジェクト設定 **Settings > Environment Variables** に以下を追加：

| 変数名 | 値 |
|--------|----|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase の Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase の anon key |
| `NEXT_PUBLIC_SITE_URL` | Vercel のデプロイ URL |

### 3. デプロイ

「Deploy」ボタンを押すと自動でビルド・デプロイされます。

### 4. Supabase の Redirect URL を更新

デプロイ後、Supabase の **Authentication > URL Configuration** に Vercel の URL を追加：

- **Site URL**: `https://devstep-task-manager-seven.vercel.app`
- **Redirect URLs**: `https://devstep-task-manager-seven.vercel.app/auth/callback`

---

## 環境変数一覧

| 変数名 | 必須 | 説明 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase プロジェクトの URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase の匿名公開キー |
| `NEXT_PUBLIC_SITE_URL` | ✅ | 本番デプロイURL <https://devstep-task-manager-seven.vercel.app> |

---

## ディレクトリ構成

```
devstep-task-manager/
├── app/
│   ├── actions/
│   │   └── auth.ts          # 認証 Server Actions
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts     # OAuth コールバック
│   ├── login/
│   │   └── page.tsx         # ログイン画面
│   ├── signup/
│   │   └── page.tsx         # 新規登録画面
│   ├── tasks/
│   │   ├── actions.ts       # タスク Server Actions (CRUD)
│   │   └── page.tsx         # タスク一覧・管理画面
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx             # ルートリダイレクト
├── components/
│   ├── auth/
│   │   └── AuthCard.tsx     # 認証カードコンポーネント
│   └── ui/
│       ├── Button.tsx
│       └── Input.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts        # ブラウザ用クライアント
│   │   └── server.ts        # サーバー用クライアント
│   └── utils.ts
├── middleware.ts            # 認証ミドルウェア
├── .env.local.example
└── README.md
```

---

## ライセンス

MIT

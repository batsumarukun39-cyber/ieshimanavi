# 家島丸ごと観光ナビ

家島諸島（兵庫県姫路市）を訪れる観光客が「今どの店が開いているか」「最終便に間に合うか」をスマホ1枚で把握できる観光ナビ PWA。店主がスマホ1タップで営業状況を更新できる管理画面も内蔵しています。

## 技術スタック

| 領域 | 採用 |
|---|---|
| フレームワーク | Next.js 16 (App Router) / TypeScript / React 19 |
| スタイル | Tailwind CSS v4 |
| DB | PostgreSQL + Prisma 6（Neon 無料枠で運用可） |
| 地図 | Leaflet + react-leaflet + OpenStreetMap (APIキー不要) |
| 多言語 | next-intl v4 (日本語 / 英語) |
| 日の出・日の入り | suncalc (クライアント計算) |
| 認証 (店主) | 自前 PIN + HMAC-SHA256 署名付き httpOnly Cookie |
| PWA | @serwist/next (Service Worker + 静的資産プリキャッシュ) |
| テスト | Vitest (openNow + ferry ロジック計 31 テスト) |
| デプロイ | Vercel (cron `/api/cron/auto-close` で自動閉店) |

---

## 🚀 本番デプロイ手順（Vercel + Neon）

### Step 1 — Neon で Postgres を作る（無料）

1. [neon.tech](https://neon.tech) でアカウント作成 → 「New Project」
2. プロジェクト名を入力して作成
3. ダッシュボードの **Connection string** をコピー  
   例: `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`

### Step 2 — ローカルでデータベースを初期化する

```bash
# 1. 依存インストール
npm install

# 2. .env ファイルを作成してNeon URLを貼る
cp .env.example .env
# DATABASE_URL= に Neon の接続文字列を設定
# SESSION_SECRET= に長いランダム文字列を設定（例: openssl rand -base64 32 の出力）

# 3. テーブル作成 + サンプルデータ投入（一度だけ）
npm run db:setup
```

> `npm run db:setup` は `prisma migrate deploy && prisma db seed` の短縮形です。  
> Neon DB にテーブルが作成され、サンプルデータが入ります。

### Step 3 — GitHub にプッシュ

```bash
git init          # リポジトリ未作成の場合
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main
```

> `.env` ファイルは `.gitignore` で除外されているのでパスワードは GitHub に上がりません。  
> `.env.example` だけがコミットされます。

### Step 4 — Vercel でデプロイ

1. [vercel.com](https://vercel.com) にログイン → **Add New Project**
2. GitHub のリポジトリを選択して **Import**
3. **Environment Variables** に以下を追加:

| 変数名 | 値 |
|---|---|
| `DATABASE_URL` | Neon の接続文字列（Step 1 でコピーしたもの） |
| `SESSION_SECRET` | ランダムな長い文字列（32文字以上） |
| `CRON_SECRET` | 任意の文字列（cronエンドポイント保護用） |
| `NEXT_PUBLIC_ISLAND_LAT` | `34.683` |
| `NEXT_PUBLIC_ISLAND_LNG` | `134.530` |

4. **Deploy** ボタンをクリック

Vercel がビルド時に自動で `prisma migrate deploy` を実行します。  
Step 2 で Neon にデータを入れてあるので、デプロイ後すぐにアプリが動きます。

### Step 5 — Cron の有効化（自動閉店機能）

`vercel.json` にすでに設定済みです：

```json
{ "crons": [{ "path": "/api/cron/auto-close", "schedule": "0 * * * *" }] }
```

Vercel Dashboard → Settings → Cron Jobs で確認できます（Pro プランでないと実際には動きませんが、APIエンドポイント自体は常時使用可能です）。

---

## ローカル開発

```bash
# .env に Neon の DATABASE_URL を設定済みの状態で
npm run dev
# → http://localhost:3000 （/ja へリダイレクト）
```

> `--webpack` フラグが付いています（日本語フォルダパスで Turbopack がクラッシュするための回避策）。

---

## ページ一覧

| URL | 説明 |
|---|---|
| `/ja` `/en` | ホーム（お知らせ・最終便カウントダウン・今日の日の入り） |
| `/ja/places` | スポット一覧・カテゴリ絞り込み |
| `/ja/places/[slug]` | スポット詳細（地図リンク・今日の営業時間） |
| `/ja/map` | Leaflet マップ（カテゴリフィルタ・現在地ボタン） |
| `/ja/ferry` | 高速船時刻表（今日の便・次の便・逆算プラン） |
| `/ja/courses` | モデルコース一覧 |
| `/ja/courses/[slug]` | コース詳細（ステップ順・営業状況バッジ） |
| `/ja/store` | 店主ログイン (PIN) |
| `/ja/store/dashboard` | 店主ダッシュボード（1タップで状態変更） |

---

## 店主向け操作

1. `/store` でお店を選び PIN を入力（サンプルデータの初期 PIN: `1234`）
2. ダッシュボードで「営業を開始する」「今日は閉める」「休憩中」を1タップ
3. 営業時間を過ぎると自動で「休業」に戻る（`/api/cron/auto-close`、毎時0分）

> **⚠️ 本番公開前に必ず PIN を変更してください**  
> `prisma/seed.ts` の `pinHash` を実際のPINの bcrypt ハッシュに差し替えるか、  
> Prisma Studio (`npx prisma studio`) で `StoreCredential.pinHash` を更新してください。

---

## 実データへの差し替え

`prisma/seed.ts` の `⚠️ サンプルデータ` コメント箇所を実際の店舗・船時刻・コースデータに置き換え、再度実行：

```bash
# 既存データを消してシードし直す場合
npx prisma db execute --stdin <<< "TRUNCATE \"Place\", \"FerrySchedule\", \"ModelCourse\", \"Notice\" CASCADE;"
npm run db:seed
```

---

## ビルド・テスト

```bash
npm run build    # 本番ビルド（prisma migrate deploy + next build）
npm run test     # Vitest ユニットテスト（31件）
npx prisma studio # DB GUI（ブラウザでデータ確認・編集）
```

---

## PWA / オフライン

Service Worker が有効（`npm run build && npm start`）になると:
- 静的ページ・JS・CSS をプリキャッシュ
- OSM 地図タイルを閲覧済み範囲でキャッシュ（CacheFirst, 30日）
- `/api/places` の最終取得データをキャッシュ（StaleWhileRevalidate）
- オフライン時は `/~offline` フォールバックを表示

---

## ディレクトリ構成（主要ファイル）

```
src/
├─ app/
│  ├─ [locale]/          # 日英 SSR/SSG ページ群
│  ├─ api/               # places / store / cron API Routes
│  ├─ sw.ts              # Service Worker エントリ (Serwist)
│  └─ ~offline/page.tsx  # オフラインフォールバック
├─ components/           # UI コンポーネント
├─ lib/                  # openNow / ferry / auth / sun ロジック
└─ types/                # 共通型定義
prisma/
├─ schema.prisma         # PostgreSQL スキーマ
├─ migrations/           # Prisma マイグレーション（自動適用）
└─ seed.ts               # サンプルデータ（⚠️ 本番前に差し替え）
```

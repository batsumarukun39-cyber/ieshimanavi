# DECISIONS — 設計上の判断記録

| # | 決定事項 | 理由 |
|---|---|---|
| 1 | create-next-app@latest により Next.js 16.2.7 / Tailwind v4 がインストールされた。設計書のv15/v3指定から変更。 | latest が16系であったため。App Router・SSR の基本APIは互換性あり。 |
| 2 | Tailwind v4 を採用（設計書はv3指定）。`@import "tailwindcss"` 形式で設定。 | create-next-app@latest のデフォルトがv4。クラス名・ユーティリティは大部分互換。 |
| 3 | seed.ts の実行に `tsx` を使用（ts-node の代替）。 | tsx は ESM・CommonJS 両対応でセットアップ不要。 |
| 4 | セッションCookieの署名は `crypto.subtle`（Web Crypto API）を使用（外部ライブラリ不要）。 | Node.js 18+ / Next.js Edge Runtime で利用可。bcrypt依存を最小化。 |
| 5 | ログイン失敗ロック（5回/15分）はインメモリMapで実装（MVP段階）。 | 本番はRedisまたはDBに移行可能。ロックは再起動でリセットされる点を許容。 |
| 6 | ビルド・開発サーバは `--webpack` フラグで Webpack を使用。 | Next.js 16 のデフォルト Turbopack が日本語フォルダ名（家島ナビ）を含むパスでパニックするバグがあるため。`next build --webpack` / `next dev --webpack` で回避。 |
| 7 | UI を「シック版」デザインへ全面刷新（Phase 7 完了後）。 | ユーザー要件「大人の島旅・瀬戸内のひなびた上質さ」。デザイントークン（paper/ink/sea/clay/sage/line 系）を globals.css @theme に一元化。フォントは Shippori Mincho（serif）+ Zen Kaku Gothic New（sans）を next/font/google で読み込み。Tabler Icons（@tabler/icons-react）を UI アイコンとして採用。ナビゲーションを上部ヘッダーのタブからボトムタブバーへ移行。StatusBadge は塗りピルをやめドット＋テキストに。カテゴリフィルターはアウトラインチップのみ（カフェ→喫茶、温泉→湯、買う→買物 等の表示名変更を含む）。 |

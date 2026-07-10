# わかめナビ🌱

埼玉大学周辺を走るバス（国際興業・西武）の運行情報を確認できる Web アプリです。  
Nuxt 4（SPA）+ Nitro API で、NAVITIME 系サイトから取得した情報を統一フォーマットで提供します。

本番: [https://wakame-navi.vercel.app/](https://wakame-navi.vercel.app/)

## セットアップ

```bash
npm install
npm run dev
```

開発サーバーは `--host` 付きで起動します（`http://localhost:3000`）。

### 環境変数

ルートに `.env` または `.env.local` を置き、Upstash Redis（Vercel KV）の接続情報を設定します。雛形は [`.env.example`](.env.example) を参照してください。

| 変数 | 説明 |
|---|---|
| `KV_REST_API_URL` | Upstash Redis の REST URL |
| `KV_REST_API_TOKEN` | Upstash Redis の REST トークン |

**本番では必須です。** 未設定の場合、レート制限基盤が使えないため API は `503` を返します。ローカル開発では未設定でも動作しますが、レート制限・キャッシュはインメモリ相当の挙動になります。

## デプロイ（Vercel）

このリポジトリは Vercel 向けです。

1. リポジトリを Vercel に接続する
2. 環境変数 `KV_REST_API_URL` / `KV_REST_API_TOKEN` を Production に設定する
3. デプロイする（`nuxt build`）

## ローカルシミュレーション（`?local`）

`npm run dev` 時のみ、結果ページの URL に `?local` を付けると API を呼ばずクライアント側の仮ダイヤで動作します（開発・デモ用）。**本番ビルドでは無効です。**

例: `/bus/result?...&local`

## スクリプト

| コマンド | 内容 |
|---|---|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド |
| `npm run preview` | ビルド結果のプレビュー |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript 型チェック（`nuxt typecheck`）。CI でも必須 |
| `npm test` | Vitest（単体テスト） |
| `npm run test:watch` | Vitest ウォッチモード |

CI（`.github/workflows/ci.yml`）では `lint` / `typecheck` / `test` を必須、`npm audit --audit-level=high` は参考実行（失敗してもジョブは落とさない）です。

## 停留所データの単一ソース

系統・停留所の正本は [`shared/utils/Bus/v2/Routes.ts`](shared/utils/Bus/v2/Routes.ts) の `ALL_ROUTES` です。  
よみがなは [`StopKana.ts`](shared/utils/Bus/v2/StopKana.ts)、ID / 名前ホワイトリストは `ALL_ROUTES` から導出します。停留所追加時はまず `Routes.ts` を更新してください。

## PWA

`@vite-pwa/nuxt` によりインストール可能な PWA として動作します。アプリシェル（静的アセット）をキャッシュし、API はネットワーク優先でオフライン時は失敗を許容します（運行データの完全オフラインは対象外）。

## ドキュメント

- [API 仕様](app/API.md)
- [型定義](app/Types.md)
- [2026-07 大規模リファクタリング記録](docs/REFACTORING_2026-07.md) — 事前調査と実施内容のまとめ

## ライセンス

[MIT](LICENSE)

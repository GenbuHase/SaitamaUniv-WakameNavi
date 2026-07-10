# API - バス運行情報 REST API (v2)

> エンドポイント定義: [`server/api/v2/bus/`](server/api/v2/bus/)

---

## 概要

埼玉大学周辺のバス運行情報を取得するための REST API です。  
国際興業バス・西武バスの両社の情報を統一フォーマットで提供します。

### ベースURL

```
/api/v2/bus
```

### ローカルシミュレーション (`?local`)

フロントエンドの結果ページ URL に `?local` を付けると、API を呼ばずクライアント側の仮ダイヤで動作します（開発・デモ用）。  
API エンドポイント自体に `local` パラメータはありません。

### 共通エラーレスポンス

| ステータス | 説明 |
|---|---|
| `400` | バリデーションエラー (必須パラメータ不足、不正な値など) |
| `429` | レート制限超過 (同一 IP あたり 60 リクエスト / 分) |
| `503` | 本番で Redis 未設定など、レート制限基盤が利用できない場合 |

---

## エンドポイント

### `GET /api/v2/bus/services`

バスの運行情報（リアルタイム位置情報）を取得します。

**ファイル**: [`server/api/v2/bus/services.ts`](server/api/v2/bus/services.ts)

フロントエンドは **会社別 NAVITIME バス停 ID** を指定します。  
レガシーの `start` / `goal` / `company`（バス停コード方式）は削除済みです。

#### パラメータ

| パラメータ | 型 | 必須 | 説明 | 例 |
|---|---|---|---|---|
| `kokusaiStartId` | `string` | ※ | 国際興業バスの出発バス停 ID (8桁) | `00021229` |
| `kokusaiGoalId` | `string` | ❌ | 国際興業バスの到着バス停 ID。省略時は全行先 | `00021176` |
| `seibuStartId` | `string` | ※ | 西武バスの出発バス停 ID (8桁) | `00111643` |
| `seibuGoalId` | `string` | ❌ | 西武バスの到着バス停 ID。省略時は主要行先を合成 | `00111628` |

※ `kokusaiStartId` と `seibuStartId` の少なくとも一方が必要です（両方指定可）。

#### リクエスト例

```
GET /api/v2/bus/services?kokusaiStartId=00021229&kokusaiGoalId=00021176&seibuStartId=00111643&seibuGoalId=00111628
GET /api/v2/bus/services?kokusaiStartId=00021229
```

#### レスポンス: `BusService[]`

```json
[
  {
    "companyCode": "KokusaiKogyo",
    "companyName": "国際興業バス",
    "route": "北浦03",
    "destination": "北浦和駅西口",
    "location": {
      "status": "running",
      "stopsAway": 3
    },
    "scheduledTime": "08:30",
    "estimatedTime": "08:58",
    "delay": 28
  },
  {
    "companyCode": "Seibu",
    "companyName": "西武バス",
    "route": "北浦03",
    "destination": "北浦和駅",
    "location": {
      "status": "approaching",
      "stopsAway": 1
    },
    "scheduledTime": "08:45",
    "estimatedTime": "08:45",
    "delay": 0
  }
]
```

片方の会社の取得に失敗しても、もう片方の結果は返します（空配列になり得ます）。

#### エラーレスポンス

| ケース | ステータス | メッセージ |
|---|---|---|
| StartId いずれも未指定 | `400` | `クエリパラメータ 'kokusaiStartId' または 'seibuStartId' が必要です。` |
| 無効なバス停 ID | `400` | `無効な〜バス停IDです。` |
| レート制限超過 | `429` | Too Many Requests |
| 本番で Redis 未設定 | `503` | サービス一時利用不可 |

#### キャッシュ

Redis (Upstash) に TTL 60 秒でキャッシュします。未設定時は都度取得します。

---

### 削除済み: `GET /api/v2/bus/routes`

路線マスタはフロントが [`shared/utils/Bus/v2/Routes.ts`](../shared/utils/Bus/v2/Routes.ts) の `ALL_ROUTES` を静的参照するため、未使用だった `/api/v2/bus/routes` は削除しました。

---

## 停留所データの単一ソース

停留所・系統の正本は [`shared/utils/Bus/v2/Routes.ts`](../shared/utils/Bus/v2/Routes.ts) です。  
よみがなは [`StopKana.ts`](../shared/utils/Bus/v2/StopKana.ts)、ID ホワイトリストは `ALL_ROUTES` から導出します。

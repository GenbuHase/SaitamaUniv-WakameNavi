# Types - バス関連 構造体定義

> 定義ファイル: [`shared/types/bus.ts`](shared/types/bus.ts)

---

## 概要

国際興業バス・西武バスの両社を統一的に扱うための型を定義しています。  
各社のスクレイパーはこれらの型に正規化してデータを返します。

### 会社コードの表記

| 層 | 国際興業 | 西武 |
|---|---|---|
| API / shared (`BusCompanyCode`) | `KokusaiKogyo` | `Seibu` |
| フロント UI (`UiCompanyCode`) | `Kokusai` | `Seibu` |

変換は [`app/composables/bus/busCompany.ts`](composables/bus/busCompany.ts) の `toUiCompany` / `toApiCompany` に集約しています。

---

## バス会社

### `BusCompanyCode`

バス会社を識別するリテラル型。

```typescript
type BusCompanyCode = "KokusaiKogyo" | "Seibu";
```

| 値 | バス会社名 |
|---|---|
| `"KokusaiKogyo"` | 国際興業バス |
| `"Seibu"` | 西武バス |

### `BusCompany`

バス会社の基本情報。

| フィールド | 型 | 説明 |
|---|---|---|
| `code` | `BusCompanyCode` | バス会社コード |
| `name` | `string` | バス会社の表示名 |

### `BUS_COMPANIES`

定義済みバス会社マスタ (`Record<BusCompanyCode, BusCompany>`)。

---

## バス停

### `BusStop`

各バス会社固有のバス停定義。同じバス停でも会社によって `id` が異なります。

| フィールド | 型 | 説明 | 例 |
|---|---|---|---|
| `id` | `string` | NAVITIME バスロケーション上のID | `"00021229"` |
| `code` | `string` | アプリ内で使用する英語コード | `"SaitamaUniv"` |
| `name` | `string` | バス停の表示名 | `"埼玉大学"` |
| `companyCode` | `BusCompanyCode` | 所属バス会社コード | `"KokusaiKogyo"` |
| `routes` | `string[]` | このバス停を通過する系統コード一覧 | `["北浦03", "南与01"]` |

> **注意**: 同名バス停でも会社ごとにIDが異なります。  
> 例: 埼玉大学 → 国際興業 `00021229` / 西武 `00111643`

---

## バス運行情報 (Service)

### `BusLocation`

バスの現在位置情報。両社の表現を統一します。

| フィールド | 型 | 説明 |
|---|---|---|
| `status` | `"approaching" \| "running" \| "not_departed"` | バスの状態 |
| `stopsAway` | `number` | 目的バス停まで何停留所前か |

**`status` の意味:**

| 値 | 説明 | `stopsAway` |
|---|---|---|
| `"approaching"` | まもなく到着 (1停留所前以内) | `0` |
| `"running"` | 走行中 | `1`〜`N` |
| `"not_departed"` | 始発バス停未出発 | `Infinity` |

**各社からの変換ルール:**

| 国際興業バス (HTML テキスト) | 西武バス (`__NUXT_DATA__` JSON) | 正規化結果 |
|---|---|---|
| `"始発バス停出発前"` | 残り時間なし / 未出発相当 | `{ status: "not_departed", stopsAway: Infinity }` |
| `"まもなく到着いたします"` | 残り約1分以内 (`PTnM`) | `{ status: "approaching", stopsAway: 0 }` |
| `"N個前"` | 残り時間から推定した停留所数 | `{ status: "running", stopsAway: N }` |

> **実装メモ (西武)**: HTML を cheerio でパースするのではなく、ページ内の `<script id="__NUXT_DATA__">` JSON をパースして運行情報を抽出します。DOM 構造変更より JSON スキーマ変更の影響を受けます。

### `BusService`

バス運行情報（各車両のリアルタイム情報）。

| フィールド | 型 | 説明 | 例 |
|---|---|---|---|
| `companyCode` | `BusCompanyCode` | バス会社コード | `"KokusaiKogyo"` |
| `companyName` | `string` | バス会社名 (表示用) | `"国際興業バス"` |
| `route` | `string` | 系統コード | `"北浦03"` |
| `destination` | `string` | 行先名 | `"北浦和駅西口"` |
| `location` | `BusLocation` | 現在位置情報 | (上記参照) |
| `scheduledTime` | `string` | 定刻 (HH:mm形式) | `"08:30"` |
| `estimatedTime` | `string` | 到着予測時刻 (HH:mm形式) | `"08:58"` |
| `delay` | `number` | 遅延分数 (分, 0以上) | `28` |

---

## バス路線情報 (Route)

### `BusRouteStop`

路線上のバス停（順序付き）。

| フィールド | 型 | 説明 | 例 |
|---|---|---|---|
| `id` | `string` | NAVITIME バスロケーション上のID | `"00021176"` |
| `name` | `string` | バス停名 | `"北浦和駅西口"` |
| `order` | `number` | 路線上の順序 (0始まり) | `0` |

### `BusRoute`

バス路線情報。

| フィールド | 型 | 説明 |
|---|---|---|
| `companyCode` | `BusCompanyCode` | バス会社コード |
| `routeCode` | `string` | 系統コード (例: `"北浦03"`) |
| `origin` | `BusRouteStop` | 始発バス停 |
| `terminal` | `BusRouteStop` | 終着バス停 |
| `stops` | `BusRouteStop[]` | 全停留所リスト (始発〜終着、順序付き) |

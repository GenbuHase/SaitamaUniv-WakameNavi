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

### 共通パラメータ

| パラメータ | 型 | 必須 | 説明 |
|---|---|---|---|
| `company` | `string` | ❌ | バス会社コード。`KokusaiKogyo` または `Seibu`。省略時は両社の情報を取得 |

### 共通エラーレスポンス

| ステータス | 説明 |
|---|---|
| `400` | バリデーションエラー (必須パラメータ不足、不正な値など) |

---

## エンドポイント

### `GET /api/v2/bus/services`

バスの運行情報（リアルタイム位置情報）を取得します。

**ファイル**: [`server/api/v2/bus/services.ts`](server/api/v2/bus/services.ts)

#### パラメータ

| パラメータ | 型 | 必須 | 説明 | 例 |
|---|---|---|---|---|
| `start` | `string` | ✅ | 出発バス停コード | `SaitamaUniv` |
| `goal` | `string` | ❌ | 到着バス停コード | `KitaUrawa` |
| `company` | `string` | ❌ | バス会社コード | `KokusaiKogyo` |

#### リクエスト例

```
GET /api/v2/bus/services?start=SaitamaUniv&goal=KitaUrawa
GET /api/v2/bus/services?start=SaitamaUniv&company=Seibu
GET /api/v2/bus/services?start=MinamiYono
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

#### エラーレスポンス

| ケース | ステータス | メッセージ |
|---|---|---|
| `start` 未指定 | `400` | `クエリパラメータ 'start' は必須です。` |
| `company` が不正 | `400` | `クエリパラメータ 'company' は 'KokusaiKogyo' または 'Seibu' を指定してください。` |

---

### `GET /api/v2/bus/routes`

バス路線情報を取得します。各系統の全停留所リスト（順序付き）を返します。

**ファイル**: [`server/api/v2/bus/routes.ts`](server/api/v2/bus/routes.ts)

#### パラメータ

| パラメータ | 型 | 必須 | 説明 | 例 |
|---|---|---|---|---|
| `start` | `string` | ❌ | 出発バス停のnavitime IDでフィルタ | `00021229` |
| `goal` | `string` | ❌ | 到着バス停のnavitime IDでフィルタ | `00021176` |
| `company` | `string` | ❌ | バス会社コード | `KokusaiKogyo` |

#### リクエスト例

```
GET /api/v2/bus/routes
GET /api/v2/bus/routes?company=Seibu
GET /api/v2/bus/routes?start=00021229
```

#### レスポンス: `BusRoute[]`

```json
[
  {
    "companyCode": "KokusaiKogyo",
    "routeCode": "北浦03",
    "origin": {
      "id": "00021176",
      "name": "北浦和駅西口",
      "order": 0
    },
    "terminal": {
      "id": "00021229",
      "name": "埼玉大学",
      "order": 9
    },
    "stops": [
      { "id": "00021176", "name": "北浦和駅西口", "order": 0 },
      { "id": "00021222", "name": "常磐十丁目", "order": 1 },
      { "id": "00021200", "name": "大戸小学校", "order": 2 },
      "..."
    ]
  }
]
```

---

### `GET /api/v2/bus/stops`

利用可能なバス停一覧を取得します。国際興業バス・西武バスの両社のバス停を統合して返します。

**ファイル**: [`server/api/v2/bus/stops.ts`](server/api/v2/bus/stops.ts)

#### パラメータ

| パラメータ | 型 | 必須 | 説明 | 例 |
|---|---|---|---|---|
| `company` | `string` | ❌ | バス会社コードでフィルタ | `Seibu` |

#### リクエスト例

```
GET /api/v2/bus/stops
GET /api/v2/bus/stops?company=KokusaiKogyo
```

#### レスポンス: `UnifiedBusStop[]`

```json
[
  {
    "code": "SaitamaUniv",
    "name": "埼玉大学",
    "companies": [
      {
        "companyCode": "KokusaiKogyo",
        "companyName": "国際興業バス",
        "id": "00021229"
      },
      {
        "companyCode": "Seibu",
        "companyName": "西武バス",
        "id": "00111643"
      }
    ],
    "routes": ["北浦03", "南与01", "志03-3", "北朝02"]
  },
  {
    "code": "KitaUrawa",
    "name": "北浦和駅西口",
    "companies": [
      {
        "companyCode": "KokusaiKogyo",
        "companyName": "国際興業バス",
        "id": "00021176"
      }
    ],
    "routes": ["北浦03"]
  }
]
```

---

## バス停コード一覧

API で使用するバス停コード (`start`, `goal` パラメータ) の一覧です。

### 国際興業バス

| コード | バス停名 | 系統 |
|---|---|---|
| `SaitamaUniv` | 埼玉大学 | 北浦03, 南与01, 志03-3, 北朝02 |
| `KitaUrawa` | 北浦和駅西口 | 北浦03 |
| `MinamiYono` | 南与野駅西口 | 南与01, 南与02, 志03-3, 北朝02 |
| `MinamiYonoKita` | 南与野駅北入口 | 北浦03 |
| `Shiki` | 志木駅東口 | 志03-3 |
| `KitaAsaka` | 北朝霞駅 | 北朝02 |
| `ShimoOkubo` | 下大久保 | 南与02, 志03-3, 北朝02, 浦13-2 |
| `SaitamaUnivUra` | 埼大裏 | 浦13, 浦13-2, 浦桜13-3 |
| `SakuraWardOffice` | 桜区役所 | 浦11, 浦12, 浦12-2, 浦桜13-3, 浦15 |
| `Urawa` | 浦和駅西口 | 浦11, 浦12, 浦12-2, 浦13, 浦13-2, 浦桜13-3, 浦15 |
| `OkuboPurificationPlant` | 大久保浄水場 | 浦13, 浦桜13-3 |

### 西武バス

| コード | バス停名 | 系統 |
|---|---|---|
| `SaitamaUniv` | 埼玉大学 | 北浦03, 南与01 |
| `KitaUrawa` | 北浦和駅 | 北浦03 |
| `MinamiYono` | 南与野駅西口 | 南与01 |
| `MinamiYonoKita` | 南与野駅北入口 | 北浦03 |

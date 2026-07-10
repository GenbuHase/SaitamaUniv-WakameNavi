/**
 * バス関連の共通型定義
 *
 * 国際興業バス・西武バスの両社を統一的に扱うための型を定義する。
 * 各社のスクレイパーはこれらの型に正規化してデータを返す。
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// バス会社
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** バス会社コード */
export type BusCompanyCode = "KokusaiKogyo" | "Seibu";

/** バス会社情報 */
export interface BusCompany {
  code: BusCompanyCode;
  name: string;
}

/** 定義済みバス会社マスタ */
export const BUS_COMPANIES: Record<BusCompanyCode, BusCompany> = {
  KokusaiKogyo: { code: "KokusaiKogyo", name: "国際興業バス" },
  Seibu: { code: "Seibu", name: "西武バス" },
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// バス停
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 各バス会社固有のバス停定義
 *
 * 同じバス停でも会社によって `id` が異なる (例: 埼玉大学は
 * 国際興業=00021229, 西武=00111643) ため、会社コードとセットで管理する。
 */
export interface BusStop {
  /** navitimeバスロケーション上のID (会社別) */
  id: string;

  /** アプリ内で使用する英語コード (例: "SaitamaUniv") */
  code: string;

  /** バス停の表示名 (例: "埼玉大学") */
  name: string;

  /** 所属バス会社コード */
  companyCode: BusCompanyCode;

  /** このバス停を通過する系統コード一覧 (例: ["北浦03", "南与01"]) */
  routes: string[];
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// バス運行情報 (Service)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * バスの現在位置情報
 *
 * 国際興業バスはテキスト (「3個前」「まもなく到着」等) から、
 * 西武バスはCSSクラス (`position-N`) から正規化される。
 */
export interface BusLocation {
  /**
   * バスの状態
   * - "approaching": まもなく到着 (1停留所前以内)
   * - "running": 走行中
   * - "not_departed": 始発バス停未出発
   */
  status: "approaching" | "running" | "not_departed";

  /**
   * 目的のバス停まで何停留所前か
   * - 0: 到着間近 (approaching のとき)
   * - 1〜N: N停留所前
   * - Infinity: 始発バス停未出発
   */
  stopsAway: number;
}

/**
 * バス運行情報 (各車両のリアルタイム情報)
 *
 * API `/api/v2/bus/services` のレスポンス要素。
 * 両社のスクレイピング結果をこの形式に正規化する。
 */
export interface BusService {
  /** バス会社コード */
  companyCode: BusCompanyCode;

  /** バス会社名 (表示用) */
  companyName: string;

  /** 系統コード (例: "北浦03") */
  route: string;

  /** 行先名 (例: "北浦和駅西口") */
  destination: string;

  /** 現在位置情報 */
  location: BusLocation;

  /** 定刻 (HH:mm形式, 例: "08:30") */
  scheduledTime: string;

  /** 到着予測時刻 (HH:mm形式, 例: "08:58") */
  estimatedTime: string;

  /** 遅延分数 (分, 0以上の整数) */
  delay: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// バス路線情報 (Route)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** 路線上のバス停 (順序付き) */
export interface BusRouteStop {
  /** navitimeバスロケーション上のID */
  id: string;

  /** バス停名 */
  name: string;

  /** 路線上の順序 (0始まり) */
  order: number;
}

/**
 * バス路線情報
 *
 * 正本は shared/utils/Bus/v2/Routes.ts の ALL_ROUTES。
 */
export interface BusRoute {
  /** バス会社コード */
  companyCode: BusCompanyCode;

  /** 系統コード (例: "北浦03") */
  routeCode: string;

  /** 始発バス停 */
  origin: BusRouteStop;

  /** 終着バス停 */
  terminal: BusRouteStop;

  /** 全停留所リスト (始発〜終着、順序付き) */
  stops: BusRouteStop[];
}

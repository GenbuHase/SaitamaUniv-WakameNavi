/**
 * バスユーティリティ 統合エントリポイント (v2)
 *
 * 国際興業バス・西武バスの運行情報取得、バス停検索、路線フィルタリングを
 * 統一的に扱うためのモジュール。
 */

import type { BusCompanyCode, BusService, BusRoute, UnifiedBusStop } from "@@/shared/types/bus";

import BusStops, {
  KokusaiKogyoStops,
  SeibuStops,
  BusStopsByCompany,
  findBusStopByCode,
  getCompaniesForStop,
  getUnifiedBusStops,
} from "./BusStops";

import Routes, {
  ALL_ROUTES,
  filterRoutes,
} from "./Routes";

import * as KokusaiKogyoBus from "./KokusaiKogyoBus";
import * as SeibuBus from "./SeibuBus";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// バス停バリデーション
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** バス停の有効性チェック結果 */
interface BusStopValidity {
  start: boolean;
  goal: boolean | null; // null = goal未指定
}

/**
 * 指定されたバス停コードの有効性をチェックする
 *
 * @param companyCode - バス会社コード (省略時は全社チェック)
 * @param startCode - 出発バス停コード
 * @param goalCode - 到着バス停コード (省略可)
 * @returns 会社ごとの有効性チェック結果
 */
function checkValidity(
  companyCode: BusCompanyCode | null,
  startCode: string,
  goalCode?: string
): Partial<Record<BusCompanyCode, BusStopValidity>> {
  const result: Partial<Record<BusCompanyCode, BusStopValidity>> = {};

  const check = (company: BusCompanyCode): BusStopValidity => ({
    start: getCompaniesForStop(startCode).includes(company),
    goal: goalCode ? getCompaniesForStop(goalCode).includes(company) : null,
  });

  if (companyCode) {
    // 特定会社のみチェック
    if (companyCode !== "KokusaiKogyo" && companyCode !== "Seibu") {
      throw new Error(`不正なバス会社コードです: '${companyCode}' (KokusaiKogyo または Seibu を指定してください)`);
    }
    result[companyCode] = check(companyCode);
  } else {
    // 全社チェック
    result.KokusaiKogyo = check("KokusaiKogyo");
    result.Seibu = check("Seibu");
  }

  return result;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 運行情報取得
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * バスの運行情報を取得する (会社横断)
 *
 * @param companyCode - バス会社コード (省略時は対象の全社から取得)
 * @param startCode - 出発バス停コード
 * @param goalCode - 到着バス停コード (省略可)
 * @returns 正規化された運行情報の配列
 */
async function getServices(
  companyCode: BusCompanyCode | null,
  startCode: string,
  goalCode?: string
): Promise<BusService[]> {
  const validity = checkValidity(companyCode, startCode, goalCode);
  const services: BusService[] = [];

  // 国際興業バス
  if (validity.KokusaiKogyo?.start && (validity.KokusaiKogyo?.goal || validity.KokusaiKogyo?.goal === null)) {
    const startStop = KokusaiKogyoStops[startCode as keyof typeof KokusaiKogyoStops];
    const goalStop = goalCode
      ? KokusaiKogyoStops[goalCode as keyof typeof KokusaiKogyoStops]
      : undefined;

    if (startStop && (goalStop || !goalCode)) {
      try {
        const goalId = goalStop?.id || startStop.id; // goal未指定時はstartと同じIDを使用
        services.push(...await KokusaiKogyoBus.getServices(startStop.id, goalId));
      } catch (e) {
        console.error("[KokusaiKogyoBus] 運行情報の取得に失敗:", e);
      }
    }
  }

  // 西武バス
  if (validity.Seibu?.start && (validity.Seibu?.goal || validity.Seibu?.goal === null)) {
    const startStop = SeibuStops[startCode as keyof typeof SeibuStops];
    const goalStop = goalCode
      ? SeibuStops[goalCode as keyof typeof SeibuStops]
      : undefined;

    if (startStop && (goalStop || !goalCode)) {
      try {
        const goalId = goalStop?.id || startStop.id;
        services.push(...await SeibuBus.getServices(startStop.id, goalId));
      } catch (e) {
        console.error("[SeibuBus] 運行情報の取得に失敗:", e);
      }
    }
  }

  return services;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 路線情報取得
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * バス路線情報を取得する
 *
 * @param options - フィルタ条件
 * @returns フィルタされた路線の配列
 */
function getRoutes(options?: {
  companyCode?: BusCompanyCode;
  startId?: string;
  goalId?: string;
}): BusRoute[] {
  return filterRoutes(options || {});
}

/**
 * バス停一覧を取得する
 *
 * @param companyCode - バス会社コードでフィルタ (省略時は全社)
 * @returns 統一バス停の配列
 */
function getStops(companyCode?: BusCompanyCode): UnifiedBusStop[] {
  return getUnifiedBusStops(companyCode);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// エクスポート
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const Bus = {
  // サブモジュール
  BusStops,
  Routes,
  KokusaiKogyoBus,
  SeibuBus,

  // バス停操作
  findBusStopByCode,
  getCompaniesForStop,
  getStops,

  // バリデーション
  checkValidity,

  // 運行情報
  getServices,

  // 路線情報
  getRoutes,
} as const;

export default Bus;

// 名前付きエクスポート
export {
  BusStops,
  Routes,
  KokusaiKogyoBus,
  SeibuBus,
  findBusStopByCode,
  getCompaniesForStop,
  getStops,
  checkValidity,
  getServices,
  getRoutes,
};
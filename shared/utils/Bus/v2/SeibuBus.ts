/**
 * 西武バス スクレイパー (v2)
 *
 * NAVITIME バスロケーションサイトから西武バスの運行情報をスクレイピングし、
 * 共通の BusService 型に正規化して返す。
 */

import { JSDOM } from "jsdom";
import Time from "@@/shared/utils/Time";
import type { BusCompanyCode, BusService, BusLocation } from "@@/shared/types/bus";
import { BUS_COMPANIES } from "@@/shared/types/bus";

/** navitimeバスロケーションのベースURL */
const FETCH_BASE_URL = "https://transfer.navitime.biz/seibubus-dia/pc/location/BusLocationResult";

/** バス会社コード */
export const COMPANY_CODE: BusCompanyCode = "Seibu";

/** バス会社名 */
export const COMPANY_NAME = BUS_COMPANIES.Seibu.name;

/**
 * スクレイピングURLを生成する
 */
function getFetchUrl(startId: string, goalId: string): string {
  return `${FETCH_BASE_URL}?startId=${startId}&goalId=${goalId}`;
}

/**
 * CSSクラスから BusLocation に正規化する
 *
 * 西武バスの位置表現:
 * - CSSクラス `position-N` (N: 1〜) → running (N停留所前)
 * - クラスが見つからない → not_departed
 */
function parseLocation(locationElement: Element | null): BusLocation {
  if (!locationElement) {
    return { status: "not_departed", stopsAway: Infinity };
  }

  const matcher = locationElement.className.match(/position-(\d+)/);
  if (!matcher) {
    return { status: "not_departed", stopsAway: Infinity };
  }

  const stops = parseInt(matcher[1]);
  return {
    status: stops <= 1 ? "approaching" : "running",
    stopsAway: stops,
  };
}

/**
 * 西武バスの系統名を正規化する
 *
 * 西武バスは系統名が全角括弧・全角数字で表示される (例: "＜北浦０３＞")。
 * これを半角数字の系統コードに変換する (例: "北浦03")。
 */
function normalizeRouteName(rawRoute: string): string {
  return rawRoute
    .replace(/[０-９]/g, str => String.fromCharCode(str.charCodeAt(0) - 0xFEE0))
    .slice(1, -1); // 括弧 ＜＞ を除去
}

/**
 * 西武バスの行先名を正規化する
 *
 * 西武バスの行先は「出発地～行先行」の形式 (例: "埼玉大学～北浦和駅行")。
 * 行先部分のみ抽出する (例: "北浦和駅")。
 */
function normalizeDestination(rawDestination: string): string {
  const parts = rawDestination.split("～");
  if (parts.length < 2) return rawDestination;
  return parts[1].slice(0, -1); // 末尾の「行」を除去
}

/**
 * 時刻テキストからHH:mm形式を抽出する
 */
function extractTime(timeText: string): string {
  const matcher = timeText.match(/\d{1,2}:\d{1,2}/);
  return matcher ? matcher[0] : "";
}

/**
 * 西武バスの運行情報を取得する
 *
 * @param startId - 出発バス停の navitime ID
 * @param goalId - 到着バス停の navitime ID
 * @returns 正規化された運行情報の配列
 */
export async function getServices(startId: string, goalId: string): Promise<BusService[]> {
  const document = (await JSDOM.fromURL(getFetchUrl(startId, goalId))).window.document;
  const elements = document.querySelectorAll("#resultList > .plotList");

  const services: BusService[] = [];
  for (const elem of elements) {
    const rawRoute = elem.querySelector(".courseName")?.textContent || "";
    const rawDestination = elem.querySelector(".destination-name")?.textContent || "";
    const locationElement = elem.querySelector(".locationClass") || null;
    const rawPlannedTime = elem.querySelector(".plannedTime")?.textContent || "";
    const rawArrivalTime = elem.querySelector(".predictionTime")?.textContent || "";

    const route = normalizeRouteName(rawRoute);
    const destination = normalizeDestination(rawDestination);
    const location = parseLocation(locationElement);
    const scheduledTime = extractTime(rawPlannedTime);
    const estimatedTime = extractTime(rawArrivalTime);

    // 遅延分数 = 到着予測時刻 - 定刻
    const delay = scheduledTime && estimatedTime
      ? Time.getDifferenceInMinutes(
          Time.parseTimeStringToDate(estimatedTime),
          Time.parseTimeStringToDate(scheduledTime)
        )
      : 0;

    services.push({
      companyCode: COMPANY_CODE,
      companyName: COMPANY_NAME,
      route,
      destination,
      location,
      scheduledTime,
      estimatedTime,
      delay: Math.max(0, delay), // 負の遅延は0に補正
    });
  }

  return services;
}

export default {
  COMPANY_CODE,
  COMPANY_NAME,
  getServices,
};
/**
 * 国際興業バス スクレイパー (v2)
 *
 * NAVITIME バスロケーションサイトから国際興業バスの運行情報をスクレイピングし、
 * 共通の BusService 型に正規化して返す。
 */

import { JSDOM } from "jsdom";
import Time from "@@/shared/utils/Time";
import type { BusCompanyCode, BusService, BusLocation } from "@@/shared/types/bus";
import { BUS_COMPANIES } from "@@/shared/types/bus";

/** navitimeバスロケーションのベースURL */
const FETCH_BASE_URL = "https://transfer.navitime.biz/5931bus/pc/location/BusLocationResult";

/** バス会社コード */
export const COMPANY_CODE: BusCompanyCode = "KokusaiKogyo";

/** バス会社名 */
export const COMPANY_NAME = BUS_COMPANIES.KokusaiKogyo.name;

/**
 * スクレイピングURLを生成する
 */
function getFetchUrl(startId: string, goalId: string): string {
  return `${FETCH_BASE_URL}?startId=${startId}&goalId=${goalId}`;
}

/**
 * 位置情報テキストを BusLocation に正規化する
 *
 * 国際興業バスの位置表現:
 * - "始発バス停出発前" → not_departed
 * - "まもなく到着いたします" → approaching (0停留所前)
 * - "N個前" → running (N停留所前)
 */
function parseLocation(locationText: string): BusLocation {
  const trimmed = locationText.trim();

  if (trimmed === "始発バス停出発前") {
    return { status: "not_departed", stopsAway: Infinity };
  }

  if (trimmed === "まもなく到着いたします") {
    return { status: "approaching", stopsAway: 0 };
  }

  const matcher = trimmed.match(/(\d+)個前/);
  if (matcher) {
    const stops = parseInt(matcher[1]);
    return {
      status: stops <= 1 ? "approaching" : "running",
      stopsAway: stops,
    };
  }

  // 想定外の形式の場合はrunningとして扱う
  return { status: "running", stopsAway: 0 };
}

/**
 * 遅延テキストを分数に変換する
 *
 * 国際興業バスの遅延表現:
 * - "遅れなし" → 0
 * - "N分" → N
 */
function parseDelay(delayText: string): number {
  if (delayText === "遅れなし") return 0;

  const matcher = delayText.match(/(\d+)分/);
  return matcher ? parseInt(matcher[1]) : 0;
}

/**
 * 国際興業バスの運行情報を取得する
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
    const route = elem.querySelector(".courseName")?.textContent || "";
    const destinationName = elem.querySelector(".destination-name")?.textContent || "";
    const destinationUnit = elem.querySelector(".destination-unit")?.textContent || "";
    const locationText = elem.querySelector(".approach-number")?.textContent || "";
    const delayText = elem.querySelector(".delay-minutes-area > .middleText")?.textContent || "";
    const scheduledTime = elem.querySelector(".on-time")?.textContent || "";

    // 行先名から単位テキストを除去 (例: "北浦和駅西口行" → "北浦和駅西口")
    const destination = destinationName.replace(destinationUnit, "");
    const location = parseLocation(locationText);
    const delay = parseDelay(delayText);

    // 到着予測時刻 = 定刻 + 遅延分数
    const estimatedTime = Time.parseDateToTimeString(
      Time.addMinutes(
        Time.parseTimeStringToDate(scheduledTime), delay
      )
    );

    services.push({
      companyCode: COMPANY_CODE,
      companyName: COMPANY_NAME,
      route,
      destination,
      location,
      scheduledTime,
      estimatedTime,
      delay,
    });
  }

  return services;
}

export default {
  COMPANY_CODE,
  COMPANY_NAME,
  getServices,
};
/**
 * 国際興業バス スクレイパー (v2)
 *
 * NAVITIME バスロケーションサイトから国際興業バスの運行情報をスクレイピングし、
 * 共通の BusService 型に正規化して返す。
 */

import * as cheerio from "cheerio";
import Time from "@@/shared/utils/Time";
import type { BusCompanyCode, BusService, BusLocation } from "@@/shared/types/bus";
import { BUS_COMPANIES } from "@@/shared/types/bus";

/** navitimeバスロケーションのベースURL */
const FETCH_BASE_URL = "https://transfer.navitime.biz/5931bus/pc/location/BusLocationResult";

/** バス会社コード */
export const COMPANY_CODE: BusCompanyCode = "KokusaiKogyo";

/** バス会社名 */
export const COMPANY_NAME = BUS_COMPANIES.KokusaiKogyo.name;

/** 外部リクエストのタイムアウト (ミリ秒) */
const FETCH_TIMEOUT_MS = 30_000;

/**
 * スクレイピングURLを生成する
 */
function getFetchUrl(startId: string, goalId: string): string {
  return `${FETCH_BASE_URL}?startId=${encodeURIComponent(startId)}&goalId=${encodeURIComponent(goalId)}`;
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
  if (matcher?.[1]) {
    const stops = parseInt(matcher[1], 10);
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
  return matcher?.[1] ? parseInt(matcher[1], 10) : 0;
}

/**
 * タイムアウト付きの fetch を実行する
 *
 * AbortController を使用し、指定時間内に応答がない場合はリクエストを中断する。
 */
async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * 国際興業バスの運行情報を取得する
 *
 * @param startId - 出発バス停の navitime ID
 * @param goalId - 到着バス停の navitime ID
 * @returns 正規化された運行情報の配列
 */
export async function getServices(startId: string, goalId: string): Promise<BusService[]> {
  // 目的地が未指定（startId === goalId）の場合、goalIdを空値にすることですべての行き先を取得できる
  const fetchGoalId = startId === goalId ? "" : goalId;
  const url = getFetchUrl(startId, fetchGoalId);

  let response: Response;
  try {
    response = await fetchWithTimeout(url, FETCH_TIMEOUT_MS);
  } catch (e) {
    console.error("[KokusaiKogyoBus] fetch failed:", {
      startId,
      goalId: fetchGoalId || "(all)",
      error: e instanceof Error ? e.message : String(e),
    });
    throw e;
  }

  if (!response.ok) {
    console.error("[KokusaiKogyoBus] HTTP error:", {
      status: response.status,
      statusText: response.statusText,
      startId,
      goalId: fetchGoalId || "(all)",
    });
    throw new Error(`KokusaiKogyo Bus Fetch Error: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  const elements = $("#resultList > .plotList").toArray();

  if (elements.length === 0) {
    // 運行なしは正常系もあり得るが、DOM構造変更の検知用に構造化ログを残す
    const hasResultList = $("#resultList").length > 0;
    console.warn("[KokusaiKogyoBus] empty services:", {
      startId,
      goalId: fetchGoalId || "(all)",
      hasResultList,
      htmlLength: html.length,
    });
  }

  const services: BusService[] = [];
  for (const elem of elements) {
    try {
      const route = $(elem).find(".courseName").text() || "";
      const destinationName = $(elem).find(".destination-name").text() || "";
      const destinationUnit = $(elem).find(".destination-unit").text() || "";
      const locationText = $(elem).find(".approach-number").text() || "";
      const delayText = $(elem).find(".delay-minutes-area > .middleText").text() || "";
      const scheduledTime = $(elem).find(".on-time").text() || "";

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
    } catch (e) {
      console.error("[KokusaiKogyoBus] parse entry failed:", e);
    }
  }

  return services;
}

export default {
  COMPANY_CODE,
  COMPANY_NAME,
  getServices,
};

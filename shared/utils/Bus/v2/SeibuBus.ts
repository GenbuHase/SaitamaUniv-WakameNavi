/**
 * 西武バス スクレイパー (v2)
 *
 * NAVITIME バスロケーションサイトから西武バスの運行情報をスクレイピングし、
 * 共通の BusService 型に正規化して返す。
 */

import Time from "@@/shared/utils/Time";
import type { BusCompanyCode, BusService, BusLocation } from "@@/shared/types/bus";
import { BUS_COMPANIES } from "@@/shared/types/bus";

/** navitimeバスロケーションのベースURL */
const FETCH_BASE_URL = "https://transfer-cloud.navitime.biz/seibubus/approachings";

/** バス会社コード */
export const COMPANY_CODE: BusCompanyCode = "Seibu";

/** バス会社名 */
export const COMPANY_NAME = BUS_COMPANIES.Seibu.name;

/** 外部リクエストのタイムアウト (ミリ秒) */
const FETCH_TIMEOUT_MS = 30_000;

/**
 * スクレイピングURLを生成する
 */
function getFetchUrl(startId: string, goalId: string): string {
  return `${FETCH_BASE_URL}?departure-busstop=${encodeURIComponent(startId)}&arrival-busstop=${encodeURIComponent(goalId)}`;
}

/**
 * 西武バスの系統名を正規化する
 */
function normalizeRouteName(rawRoute: string): string {
  return rawRoute.replace(/[０-９]/g, str => String.fromCharCode(str.charCodeAt(0) - 0xfee0)).replace(/[＜＞]/g, ""); // 括弧 ＜＞ を除去
}

/**
 * 西武バスの行先名を正規化する
 */
function normalizeDestination(rawDestination: string): string {
  const parts = rawDestination.split("～");
  if (parts.length < 2) return rawDestination.replace("行", "");
  return (parts[1] ?? rawDestination).replace("行", ""); // 末尾の「行」を除去
}

/**
 * 時刻テキストからHH:mm形式を抽出する
 */
function extractTime(timeText: string): string {
  const matcher = timeText.match(/\d{1,2}:\d{1,2}/);
  return matcher ? matcher[0] : "";
}

/**
 * タイムアウト付きの fetch を実行する
 *
 * AbortController を使用し、指定時間内に応答がない場合はリクエストを中断する。
 */
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function getServices(startId: string, goalId: string): Promise<BusService[]> {
  // 目的地が未指定（startId === goalId）の場合、Navitime Cloudでは403/404エラーになるため
  // 主要な行き先をすべて並列で取得して合成する
  if (startId === goalId) {
    const defaultGoals = ["00111643", "00111628", "00111644"].filter(id => id !== startId);
    const results = await Promise.all(defaultGoals.map(dest => fetchServices(startId, dest).catch(() => [])));

    const uniqueServices = new Map<string, BusService>();
    for (const res of results) {
      for (const service of res) {
        // 同じ便が複数回取得される可能性があるので、定刻と系統で一意にする
        uniqueServices.set(`${service.scheduledTime}_${service.route}_${service.destination}`, service);
      }
    }
    // 時間順にソートする
    return Array.from(uniqueServices.values()).sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
  }

  return fetchServices(startId, goalId);
}

async function fetchServices(startId: string, goalId: string): Promise<BusService[]> {
  const url = getFetchUrl(startId, goalId);
  const response = await fetchWithTimeout(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
  }, FETCH_TIMEOUT_MS);

  if (!response.ok) {
    throw new Error(`Seibu Bus Fetch Error: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const match = html.match(/<script type="application\/json" id="__NUXT_DATA__" data-ssr="true">([\s\S]*?)<\/script>/);
  if (!match) {
    console.error("[SeibuBus] __NUXT_DATA__ not found (page structure may have changed):", {
      startId,
      goalId,
      htmlLength: html.length,
    });
    return [];
  }

  const nuxtDataJson = match[1];
  if (!nuxtDataJson) {
    return [];
  }

  let data: unknown[];
  try {
    data = JSON.parse(nuxtDataJson) as unknown[];
  } catch (e) {
    console.error("[SeibuBus] __NUXT_DATA__ JSON parse failed:", {
      startId,
      goalId,
      error: e instanceof Error ? e.message : String(e),
    });
    return [];
  }

  const resolve = (val: unknown): unknown => (typeof val === "number" ? data[val] : val);
  const asRecord = (val: unknown): Record<string, unknown> | null =>
    val && typeof val === "object" ? val as Record<string, unknown> : null;
  const asString = (val: unknown): string => (typeof val === "string" ? val : "");

  const services: BusService[] = [];

  for (const item of data) {
    const row = asRecord(item);
    if (row && row.courseName && row.origin && row.destination && row.predictedDuration) {
      const rawRoute = asString(resolve(row.courseName));
      const rawDestination = asString(resolve(row.destination));

      const departureInfo = asRecord(resolve(row.departure));
      if (!departureInfo) continue;

      const rawScheduledTime = asString(resolve(departureInfo.scheduledDepartureTime));
      const rawEstimatedTime = asString(resolve(departureInfo.predictedDepartureTime));

      const scheduledTime = extractTime(rawScheduledTime);
      const estimatedTime = extractTime(rawEstimatedTime);

      const delayMinutes = scheduledTime && estimatedTime ? Time.getDifferenceInMinutes(Time.parseTimeStringToDate(estimatedTime), Time.parseTimeStringToDate(scheduledTime)) : 0;

      // 状態推定 (残り時間のインデックスを探して発車間近か判定)
      let locationStatus: BusLocation = { status: "running", stopsAway: 1 };
      const remainingTimeInfo = asString(resolve(departureInfo.remainingTimeUntilDeparture));
      if (remainingTimeInfo && remainingTimeInfo.includes("M")) {
        const minMatch = remainingTimeInfo.match(/PT(\d+)M/);
        if (minMatch?.[1]) {
          const min = parseInt(minMatch[1], 10);
          if (min <= 1) {
            locationStatus = { status: "approaching", stopsAway: 0 };
          } else {
            locationStatus = { status: "running", stopsAway: Math.max(1, Math.floor(min / 2)) };
          }
        }
      }

      services.push({
        companyCode: COMPANY_CODE,
        companyName: COMPANY_NAME,
        route: normalizeRouteName(rawRoute),
        destination: normalizeDestination(rawDestination),
        location: locationStatus,
        scheduledTime,
        estimatedTime,
        delay: Math.max(0, delayMinutes)
      });
    }
  }

  return services;
}

export default {
  COMPANY_CODE,
  COMPANY_NAME,
  getServices
};

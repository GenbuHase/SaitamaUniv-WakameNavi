/**
 * NAVITIME Cloud (transfer-cloud.navitime.biz) 共通パーサー・スクレイパー
 *
 * 国際興業バス・西武バスの両社で採用されている NAVITIME Cloud の
 * Nuxt 3 SSR HTML (`__NUXT_DATA__`) からリアルタイム運行情報を抽出し、
 * 共通の BusService 型に正規化して提供する。
 */

import Time from "@@/shared/utils/Time";
import { ALL_ROUTES } from "@@/shared/utils/Bus/v2/Routes";
import type { BusCompanyCode, BusService, BusLocation } from "@@/shared/types/bus";

/** 外部リクエストのタイムアウト (ミリ秒) */
export const FETCH_TIMEOUT_MS = 30_000;

/**
 * ISO 8601 Duration 文字列 (例: "PT0S", "PT1M30S", "-PT2M") を分数 (整数) に変換する
 */
export function parseIsoDuration(durationStr?: string | null): number {
  if (!durationStr || typeof durationStr !== "string") return 0;

  const isNegative = durationStr.startsWith("-");
  const clean = durationStr.replace(/^-?PT/, "");

  let minutes = 0;
  let seconds = 0;

  const mMatch = clean.match(/(\d+)M/);
  if (mMatch?.[1]) {
    minutes = parseInt(mMatch[1], 10);
  }

  const sMatch = clean.match(/(\d+)S/);
  if (sMatch?.[1]) {
    seconds = parseInt(sMatch[1], 10);
  }

  const totalMinutes = Math.round(minutes + seconds / 60);
  return isNegative ? -totalMinutes : totalMinutes;
}

/**
 * ISO 8601 時刻文字列 ("2026-09-07T09:44:00+09:00") または "HH:mm" 形式から "HH:mm" を抽出する
 */
export function extractTime(timeStr?: string | null): string {
  if (!timeStr || typeof timeStr !== "string") return "";
  const matcher = timeStr.match(/(\d{1,2}):(\d{2})/);
  if (!matcher?.[1] || !matcher?.[2]) return "";
  return `${matcher[1].padStart(2, "0")}:${matcher[2]}`;
}

/**
 * 系統名を正規化する (全角数字の半角化、＜＞の除去等)
 */
export function normalizeRouteName(rawRoute: string): string {
  return rawRoute
    .replace(/[０-９]/g, str => String.fromCharCode(str.charCodeAt(0) - 0xfee0))
    .replace(/[＜＞]/g, "")
    .trim();
}

/**
 * 行先名を正規化する (先頭の発地・経由括弧の除去、～の後方抽出、末尾「行」の除去等)
 */
export function normalizeDestination(rawDestination: string): string {
  let dest = rawDestination.trim();

  // "～" で区切られている場合は末尾側を採用 (例: "成増駅～石神井公園駅" → "石神井公園駅")
  const parts = dest.split("～");
  if (parts.length >= 2 && parts[1]) {
    dest = parts[1];
  }

  // 先頭の括弧を除去 (例: "（埼大通り発）北浦和駅西口" → "北浦和駅西口")
  dest = dest.replace(/^（[^）]+）/, "").replace(/^\([^)]+\)/, "");

  // 末尾の「行」を除去
  dest = dest.replace(/行$/, "");

  return dest.trim();
}

/**
 * Nuxt 3 の devalue ペイロード (インデックス参照配列) を安全に再帰解決する
 */
export function resolveNuxtPayload(data: unknown[]): unknown {
  function resolve(val: unknown, depth = 0, seen = new Set<number>()): unknown {
    if (depth > 20) return val;

    if (typeof val === "number") {
      if (val >= 0 && val < data.length) {
        if (seen.has(val)) return null;
        seen.add(val);
        const res = resolve(data[val], depth + 1, seen);
        seen.delete(val);
        return res;
      }
    }

    if (Array.isArray(val)) {
      return val.map(item => resolve(item, depth + 1, seen));
    }

    if (val && typeof val === "object") {
      const res: Record<string, unknown> = {};
      for (const k of Object.keys(val)) {
        res[k] = resolve((val as Record<string, unknown>)[k], depth + 1, seen);
      }
      return res;
    }

    return val;
  }

  const root = data[1] as Record<string, unknown> | undefined;
  if (!root || !("data" in root)) return null;

  return resolve(root.data);
}

/**
 * HTML文字列から `__NUXT_DATA__` を抽出し、`approachings` 配列を取得する
 */
export function extractApproachingsFromHtml(html: string): Record<string, unknown>[] {
  const match = html.match(/<script[^>]*id="__NUXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!match?.[1]) {
    return [];
  }

  let rawData: unknown[];
  try {
    rawData = JSON.parse(match[1]) as unknown[];
  } catch {
    return [];
  }

  const resolvedData = resolveNuxtPayload(rawData);
  if (!resolvedData || typeof resolvedData !== "object") {
    return [];
  }

  const container = resolvedData as Record<string, unknown>;
  for (const key of Object.keys(container)) {
    const sub = container[key];
    if (sub && typeof sub === "object") {
      const subRecord = sub as Record<string, unknown>;
      for (const subKey of Object.keys(subRecord)) {
        if (subKey.includes("busstops/approachings")) {
          const target = subRecord[subKey] as Record<string, unknown> | undefined;
          if (target && Array.isArray(target.approachings)) {
            return target.approachings as Record<string, unknown>[];
          }
        }
      }
      if (Array.isArray(subRecord.approachings)) {
        return subRecord.approachings as Record<string, unknown>[];
      }
    }
  }

  return [];
}

/**
 * 単一の approaching レコードを BusService 型にパース・変換する
 */
export function parseApproachingItem(
  item: Record<string, unknown>,
  companyCode: BusCompanyCode,
  companyName: string
): BusService | null {
  const rawCourseName = typeof item.courseName === "string" ? item.courseName : "";
  const rawDestination = typeof item.destination === "string" ? item.destination : "";

  const route = normalizeRouteName(rawCourseName);
  const destination = normalizeDestination(rawDestination);

  const dep = (item.departure && typeof item.departure === "object" ? item.departure : {}) as Record<string, unknown>;

  const scheduledRaw = (dep.scheduledDepartureTime || dep.scheduledArrivalTime || "") as string;
  const predictedRaw = (dep.predictedDepartureTime || dep.predictedArrivalTime || "") as string;

  const scheduledTime = extractTime(scheduledRaw);
  const estimatedTime = extractTime(predictedRaw) || scheduledTime;

  if (!scheduledTime) {
    return null;
  }

  let delay = 0;
  if (dep.delayOfDeparture) {
    delay = Math.max(0, parseIsoDuration(dep.delayOfDeparture as string));
  } else if (dep.delayOfArrival) {
    delay = Math.max(0, parseIsoDuration(dep.delayOfArrival as string));
  } else if (scheduledTime && estimatedTime) {
    delay = Math.max(
      0,
      Time.getDifferenceInMinutes(
        Time.parseTimeStringToDate(estimatedTime),
        Time.parseTimeStringToDate(scheduledTime)
      )
    );
  }

  let locationStatus: BusLocation = { status: "running", stopsAway: 1 };
  const remainingTime = (dep.remainingTimeUntilDeparture || dep.remainingTimeUntilArrival) as string | undefined;

  if (remainingTime) {
    const remMinutes = parseIsoDuration(remainingTime);
    if (remMinutes <= 1) {
      locationStatus = { status: "approaching", stopsAway: 0 };
    } else {
      locationStatus = {
        status: "running",
        stopsAway: Math.max(1, Math.floor(remMinutes / 2)),
      };
    }
  }

  return {
    companyCode,
    companyName,
    route,
    destination,
    location: locationStatus,
    scheduledTime,
    estimatedTime,
    delay,
  };
}

/**
 * タイムアウト付きの fetch を実行する
 */
export async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * 当該停留所を含む指定会社の系統から、行き先候補（終着停留所など）を導出する
 */
export function getDefaultGoalsForStop(companyCode: BusCompanyCode, startId: string): string[] {
  const goals = new Set<string>();

  for (const route of ALL_ROUTES) {
    if (route.companyCode !== companyCode) continue;

    const stopIndex = route.stops.findIndex(s => s.id === startId);
    if (stopIndex === -1) continue;

    const origin = route.stops[0];
    const terminal = route.stops[route.stops.length - 1];

    if (terminal && terminal.id !== startId && stopIndex < route.stops.length - 1) {
      goals.add(terminal.id);
    }
    if (origin && origin.id !== startId && stopIndex > 0) {
      goals.add(origin.id);
    }
  }

  return Array.from(goals);
}

/**
 * 指定テナント (5931bus または seibubus) から運行情報を取得する共通ロジック
 */
export async function fetchNavitimeCloudServices(options: {
  tenant: "5931bus" | "seibubus";
  companyCode: BusCompanyCode;
  companyName: string;
  startId: string;
  goalId: string;
  timeoutMs?: number;
}): Promise<BusService[]> {
  const { tenant, companyCode, companyName, startId, goalId, timeoutMs = FETCH_TIMEOUT_MS } = options;

  if (startId === goalId) {
    const defaultGoals = getDefaultGoalsForStop(companyCode, startId);
    if (defaultGoals.length === 0) {
      console.warn(`[NavitimeCloud:${companyCode}] no default goals for stop:`, startId);
      return [];
    }

    const results = await Promise.all(
      defaultGoals.map(dest =>
        fetchSingleRouteServices({
          tenant,
          companyCode,
          companyName,
          startId,
          goalId: dest,
          timeoutMs,
        }).catch(() => [])
      )
    );

    const uniqueServices = new Map<string, BusService>();
    for (const res of results) {
      for (const service of res) {
        uniqueServices.set(`${service.scheduledTime}_${service.route}_${service.destination}`, service);
      }
    }

    return Array.from(uniqueServices.values()).sort((a, b) =>
      a.scheduledTime.localeCompare(b.scheduledTime)
    );
  }

  return fetchSingleRouteServices({
    tenant,
    companyCode,
    companyName,
    startId,
    goalId,
    timeoutMs,
  });
}

/**
 * 単一の区間 (startId -> goalId) の運行情報を取得する
 */
async function fetchSingleRouteServices(options: {
  tenant: "5931bus" | "seibubus";
  companyCode: BusCompanyCode;
  companyName: string;
  startId: string;
  goalId: string;
  timeoutMs: number;
}): Promise<BusService[]> {
  const { tenant, companyCode, companyName, startId, goalId, timeoutMs } = options;

  const url = `https://transfer-cloud.navitime.biz/${tenant}/approachings?departure-busstop=${encodeURIComponent(startId)}&arrival-busstop=${encodeURIComponent(goalId)}`;

  let response: Response;
  try {
    response = await fetchWithTimeout(url, timeoutMs);
  } catch (e) {
    console.error(`[NavitimeCloud:${companyCode}] fetch failed:`, {
      startId,
      goalId,
      error: e instanceof Error ? e.message : String(e),
    });
    throw e;
  }

  if (!response.ok) {
    throw new Error(`${companyCode} Bus Fetch Error: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const approachings = extractApproachingsFromHtml(html);

  const services: BusService[] = [];
  for (const item of approachings) {
    const parsed = parseApproachingItem(item, companyCode, companyName);
    if (parsed) {
      services.push(parsed);
    }
  }

  return services;
}

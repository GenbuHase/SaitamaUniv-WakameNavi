/**
 * バス路線データ構築モジュール
 *
 * shared/utils/Bus/v2/Routes.ts の ALL_ROUTES を参照し、
 * フロントエンド用のルートデータとローカルシミュレーション用の
 * スケジュールデータを構築する。
 */

import { ALL_ROUTES } from "@@/shared/utils/Bus/v2/Routes";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// shared のルートデータから会社・系統ごとのバス停リストを生成
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type RawStopEntry = { id: string; name: string };

/** 国際興業バスの系統別バス停リスト */
export const KOKUSAI_ROUTES_DATA: Record<string, RawStopEntry[]> = {};

/** 西武バスの系統別バス停リスト */
export const SEIBU_ROUTES_DATA: Record<string, RawStopEntry[]> = {};

// ALL_ROUTES から会社別に振り分け
for (const route of ALL_ROUTES) {
  const stops = route.stops.map(s => ({ id: s.id, name: s.name }));
  if (route.companyCode === "KokusaiKogyo") {
    KOKUSAI_ROUTES_DATA[route.routeCode] = stops;
  } else if (route.companyCode === "Seibu") {
    SEIBU_ROUTES_DATA[route.routeCode] = stops;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ローカルシミュレーション用データ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** シミュレーション用の仮時刻表パターン */
export const BASE_SCHEDULE_TEMPLATE = [
  "06:10", "06:25", "06:40", "06:55", "07:05", "07:15", "07:25", "07:35",
  "07:45", "07:55", "08:05", "08:15", "08:25", "08:40", "08:55", "09:10",
  "09:25", "09:40", "09:55", "10:15", "10:45", "11:15", "11:45", "12:15",
  "12:45", "13:15", "13:45", "14:15", "14:45", "15:05", "15:25", "15:45",
  "16:05", "16:20", "16:35", "16:50", "17:05", "17:15", "17:30", "17:45",
  "18:00", "18:15", "18:30", "18:45", "19:00", "19:15", "19:30", "19:50",
  "20:10", "20:30", "20:50", "21:20", "21:50"
];

/**
 * 時刻リストを指定分数ずらす
 *
 * 系統が重なった時に見やすくするため、系統ごとに微小なオフセットを加える。
 */
export function shiftSchedule(schedule: string[], minutes: number): string[] {
  return schedule.map(time => {
    const [h, m] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(h, m + minutes, 0, 0);
    return date.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ルートデータ型定義
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** フロントエンド用のルートデータ */
export interface GeneratedRoute {
  id: string;
  code: string;
  company: "Kokusai" | "Seibu";
  name: string;
  destination: string;
  color: string;
  textColor: string;
  borderColor: string;
  stops: { name: string; offset: number }[];
  baseSchedule: string[];
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ルート生成
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** 会社ごとのスタイル定義 */
function getCompanyStyles(company: "Kokusai" | "Seibu") {
  return company === "Kokusai"
    ? { color: "bg-green-700", textColor: "text-green-700", borderColor: "border-green-700" }
    : { color: "bg-cyan-600", textColor: "text-cyan-600", borderColor: "border-cyan-600" };
}

/**
 * 指定されたバス停リストから往路・復路を生成する
 */
function createRouteVariants(
  companyPrefix: string,
  code: string,
  stops: RawStopEntry[],
  baseScheduleTemplate: string[],
  indexOffset: number
): GeneratedRoute[] {
  const routes: GeneratedRoute[] = [];
  const company: "Kokusai" | "Seibu" = companyPrefix === "kk" ? "Kokusai" : "Seibu";
  const styles = getCompanyStyles(company);

  // 1. 往路 (Outbound)
  routes.push({
    id: `${companyPrefix}_${code}_out`,
    code,
    company,
    name: `${code}: ${stops[0].name} → ${stops[stops.length - 1].name}`,
    destination: stops[stops.length - 1].name,
    ...styles,
    stops: stops.map((s, i) => ({ name: s.name, offset: i * 2 })),
    baseSchedule: shiftSchedule(baseScheduleTemplate, indexOffset)
  });

  // 2. 復路 (Inbound) - 逆順
  const reversedStops = [...stops].reverse();
  routes.push({
    id: `${companyPrefix}_${code}_in`,
    code,
    company,
    name: `${code}: ${reversedStops[0].name} → ${reversedStops[reversedStops.length - 1].name}`,
    destination: reversedStops[reversedStops.length - 1].name,
    ...styles,
    stops: reversedStops.map((s, i) => ({ name: s.name, offset: i * 2 })),
    // 復路は少し時間をずらす (例: +15分)
    baseSchedule: shiftSchedule(baseScheduleTemplate, indexOffset + 15)
  });

  return routes;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 生成済みルートデータ (モジュールロード時に一度だけ実行)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** 全系統のシミュレーション用ルート (往復含む) */
export const GENERATED_ROUTES: GeneratedRoute[] = [];

// 国際興業バス
Object.entries(KOKUSAI_ROUTES_DATA).forEach(([code, stops], index) => {
  const variants = createRouteVariants("kk", code, stops, BASE_SCHEDULE_TEMPLATE, index * 3);
  GENERATED_ROUTES.push(...variants);
});

// 西武バス
Object.entries(SEIBU_ROUTES_DATA).forEach(([code, stops], index) => {
  const variants = createRouteVariants("seibu", code, stops, BASE_SCHEDULE_TEMPLATE, index * 7 + 2);
  GENERATED_ROUTES.push(...variants);
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// バス停の優先順位ソート
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** 主要バス停の表示優先順位 */
const STOP_PRIORITY = [
  "埼玉大学", "北浦和駅", "北浦和駅西口", "南与野駅西口",
  "南与野駅北入口", "志木駅東口", "北朝霞駅", "埼大裏",
  "浦和駅西口", "桜区役所", "大久保団地"
];

/** バス停名を優先順位でソートする比較関数 */
export function sortStopsByPriority(a: string, b: string): number {
  const indexA = STOP_PRIORITY.indexOf(a);
  const indexB = STOP_PRIORITY.indexOf(b);
  if (indexA !== -1 && indexB !== -1) return indexA - indexB;
  if (indexA !== -1) return -1;
  if (indexB !== -1) return 1;
  return a.localeCompare(b, "ja");
}

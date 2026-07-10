/**
 * サーバーサイド バリデーションユーティリティ
 *
 * バス停IDのホワイトリスト検証、クエリパラメータの型安全な取得を提供する。
 * SSRF対策として、外部URLに渡す前に必ずこのモジュールでバリデーションを行う。
 */

import { ALL_ROUTES } from "@@/shared/utils/Bus/v2/Routes";
import type { BusCompanyCode } from "@@/shared/types/bus";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// バス停IDホワイトリスト (モジュールロード時に一度だけ構築)
// Routes.ts の ALL_ROUTES が単一ソース
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** 国際興業バスの有効なバス停ID */
const VALID_KOKUSAI_IDS = new Set<string>();

/** 西武バスの有効なバス停ID */
const VALID_SEIBU_IDS = new Set<string>();

/** 全社のバス停IDを統合したホワイトリスト */
const VALID_ALL_IDS = new Set<string>();

// Routes.ts の全路線データからバス停IDを収集
for (const route of ALL_ROUTES) {
  const idSet = route.companyCode === "KokusaiKogyo" ? VALID_KOKUSAI_IDS : VALID_SEIBU_IDS;
  for (const stop of route.stops) {
    idSet.add(stop.id);
    VALID_ALL_IDS.add(stop.id);
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// バリデーション関数
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** バス停IDの形式が有効か (8桁の数字) */
function isValidIdFormat(id: string): boolean {
  return /^\d{8}$/.test(id);
}

/** 国際興業バスの有効なバス停IDか */
export function isValidKokusaiId(id: string): boolean {
  return isValidIdFormat(id) && VALID_KOKUSAI_IDS.has(id);
}

/** 西武バスの有効なバス停IDか */
export function isValidSeibuId(id: string): boolean {
  return isValidIdFormat(id) && VALID_SEIBU_IDS.has(id);
}

/** いずれかの会社の有効なバス停IDか */
export function isValidBusStopId(id: string): boolean {
  return isValidIdFormat(id) && VALID_ALL_IDS.has(id);
}

/** 有効なバス会社コードか */
export function isValidCompanyCode(code: string): code is BusCompanyCode {
  return code === "KokusaiKogyo" || code === "Seibu";
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// クエリパラメータ安全取得ヘルパー
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * クエリパラメータを安全に文字列として取得する
 *
 * Nuxt の getQuery() は配列やオブジェクトを返す可能性があるため、
 * 文字列以外の値を安全に除外する。
 */
export function safeGetString(value: unknown): string | undefined {
  if (typeof value === "string" && value.length > 0 && value.length <= 100) {
    return value;
  }
  return undefined;
}

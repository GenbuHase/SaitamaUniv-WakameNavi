/**
 * バス会社コードの UI / API 間マッピング
 *
 * API・shared 層は `KokusaiKogyo`、フロント UI は短い `Kokusai` を使う。
 * 変換をここに集約し、散在する三項演算子を減らす。
 */

import type { BusCompanyCode } from "@@/shared/types/bus";
import { BUS_COMPANIES } from "@@/shared/types/bus";

/** フロント UI 用の会社コード */
export type UiCompanyCode = "Kokusai" | "Seibu";

/** API 会社コード → UI 会社コード */
export function toUiCompany(code: BusCompanyCode): UiCompanyCode {
  return code === "KokusaiKogyo" ? "Kokusai" : "Seibu";
}

/** UI 会社コード → API 会社コード */
export function toApiCompany(code: UiCompanyCode): BusCompanyCode {
  return code === "Kokusai" ? "KokusaiKogyo" : "Seibu";
}

/** UI 会社コードから表示名を取得 */
export function getCompanyDisplayName(code: UiCompanyCode): string {
  return BUS_COMPANIES[toApiCompany(code)].name;
}

/** UI 会社コードから短いラベルを取得 */
export function getCompanyShortLabel(code: UiCompanyCode): string {
  return code === "Kokusai" ? "国際" : "西武";
}

/** 時刻表行などで使う Tailwind クラス */
export function getCompanyStyles(company: UiCompanyCode) {
  return company === "Kokusai"
    ? { textColor: "text-green-700", borderColor: "border-green-700", color: "bg-green-700" }
    : { textColor: "text-cyan-600", borderColor: "border-cyan-600", color: "bg-cyan-600" };
}

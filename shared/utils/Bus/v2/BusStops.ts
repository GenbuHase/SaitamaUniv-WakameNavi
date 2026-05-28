/**
 * バス停データ定義 (v2)
 *
 * 国際興業バス・西武バスの主要バス停を定義する。
 * 各バス停は BusStop 型に準拠し、会社ごとのIDを持つ。
 */

import type { BusStop, BusCompanyCode } from "@@/shared/types/bus";
import { BUS_COMPANIES } from "@@/shared/types/bus";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 国際興業バス バス停
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const KokusaiKogyoStops = {
  SaitamaUniv: {
    id: "00021229",
    code: "SaitamaUniv",
    name: "埼玉大学",
    companyCode: "KokusaiKogyo" as BusCompanyCode,
    routes: ["北浦03", "南与01", "志03-3", "北朝02", "桜区01"],
  },

  KitaUrawa: {
    id: "00021176",
    code: "KitaUrawa",
    name: "北浦和駅西口",
    companyCode: "KokusaiKogyo" as BusCompanyCode,
    routes: ["北浦03"],
  },

  MinamiYono: {
    id: "00021362",
    code: "MinamiYono",
    name: "南与野駅西口",
    companyCode: "KokusaiKogyo" as BusCompanyCode,
    routes: ["南与01", "南与02", "志03-3", "北朝02"],
  },

  MinamiYonoKita: {
    id: "00021224",
    code: "MinamiYonoKita",
    name: "南与野駅北入口",
    companyCode: "KokusaiKogyo" as BusCompanyCode,
    routes: ["北浦03"],
  },

  Shiki: {
    id: "00021278",
    code: "Shiki",
    name: "志木駅東口",
    companyCode: "KokusaiKogyo" as BusCompanyCode,
    routes: ["志03-3"],
  },

  KitaAsaka: {
    id: "00021352",
    code: "KitaAsaka",
    name: "北朝霞駅",
    companyCode: "KokusaiKogyo" as BusCompanyCode,
    routes: ["北朝02"],
  },

  ShimoOkubo: {
    id: "00021187",
    code: "ShimoOkubo",
    name: "下大久保",
    companyCode: "KokusaiKogyo" as BusCompanyCode,
    routes: ["南与02", "志03-3", "北朝02", "浦13-2"],
  },

  SaitamaUnivUra: {
    id: "00021185",
    code: "SaitamaUnivUra",
    name: "埼大裏",
    companyCode: "KokusaiKogyo" as BusCompanyCode,
    routes: ["浦13", "浦13-2", "浦桜13-3", "桜区01"],
  },

  SakuraWardOffice: {
    id: "00021360",
    code: "SakuraWardOffice",
    name: "桜区役所",
    companyCode: "KokusaiKogyo" as BusCompanyCode,
    routes: ["浦11", "浦12", "浦12-2", "浦桜13-3", "浦15", "桜区01"],
  },

  Urawa: {
    id: "00021083",
    code: "Urawa",
    name: "浦和駅西口",
    companyCode: "KokusaiKogyo" as BusCompanyCode,
    routes: ["浦11", "浦12", "浦12-2", "浦13", "浦13-2", "浦桜13-3", "浦15"],
  },

  OkuboPurificationPlant: {
    id: "00021193",
    code: "OkuboPurificationPlant",
    name: "大久保浄水場",
    companyCode: "KokusaiKogyo" as BusCompanyCode,
    routes: ["浦13", "浦桜13-3"],
  },

  NishiUrawa: {
    id: "00021895",
    code: "NishiUrawa",
    name: "西浦和駅",
    companyCode: "KokusaiKogyo" as BusCompanyCode,
    routes: ["桜区01"],
  },

  NakaUrawa: {
    id: "00021161",
    code: "NakaUrawa",
    name: "中浦和駅",
    companyCode: "KokusaiKogyo" as BusCompanyCode,
    routes: ["浦11", "桜区01"],
  },
} as const satisfies Record<string, BusStop>;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 西武バス バス停
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const SeibuStops = {
  SaitamaUniv: {
    id: "00111643",
    code: "SaitamaUniv",
    name: "埼玉大学",
    companyCode: "Seibu" as BusCompanyCode,
    routes: ["北浦03", "南与01"],
  },

  KitaUrawa: {
    id: "00111628",
    code: "KitaUrawa",
    name: "北浦和駅",
    companyCode: "Seibu" as BusCompanyCode,
    routes: ["北浦03", "北浦10", "北浦11", "北浦15"],
  },

  MinamiYono: {
    id: "00111644",
    code: "MinamiYono",
    name: "南与野駅西口",
    companyCode: "Seibu" as BusCompanyCode,
    routes: ["南与01"],
  },

  MinamiYonoKita: {
    id: "00111639",
    code: "MinamiYonoKita",
    name: "南与野駅北入口",
    companyCode: "Seibu" as BusCompanyCode,
    routes: ["北浦03"],
  },

  UrawaKitaHighSchool: {
    id: "00111610",
    code: "UrawaKitaHighSchool",
    name: "浦和北高校",
    companyCode: "Seibu" as BusCompanyCode,
    routes: ["北浦10"],
  },

  Okubo: {
    id: "00111635",
    code: "Okubo",
    name: "大久保",
    companyCode: "Seibu" as BusCompanyCode,
    routes: ["北浦10", "北浦11", "北浦15"],
  },

  KamogawaDanchi: {
    id: "00111599",
    code: "KamogawaDanchi",
    name: "加茂川団地",
    companyCode: "Seibu" as BusCompanyCode,
    routes: ["北浦15"],
  },
} as const satisfies Record<string, BusStop>;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 会社別バス停マップ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const BusStopsByCompany: Record<BusCompanyCode, Record<string, BusStop>> = {
  KokusaiKogyo: KokusaiKogyoStops,
  Seibu: SeibuStops,
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ユーティリティ関数
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * バス停コードからバス停情報を取得する (会社を横断して検索)
 */
export function findBusStopByCode(code: string, companyCode?: BusCompanyCode): BusStop | undefined {
  if (companyCode) {
    const stops = BusStopsByCompany[companyCode];
    return stops[code];
  }

  // 会社未指定の場合は全社を検索 (国際興業を優先)
  return KokusaiKogyoStops[code as keyof typeof KokusaiKogyoStops]
    || SeibuStops[code as keyof typeof SeibuStops];
}

/**
 * 指定バス停コードが所属する会社の一覧を返す
 */
export function getCompaniesForStop(code: string): BusCompanyCode[] {
  const companies: BusCompanyCode[] = [];
  if (code in KokusaiKogyoStops) companies.push("KokusaiKogyo");
  if (code in SeibuStops) companies.push("Seibu");
  return companies;
}

export default {
  KokusaiKogyo: KokusaiKogyoStops,
  Seibu: SeibuStops,
  BusStopsByCompany,
  findBusStopByCode,
  getCompaniesForStop,
};
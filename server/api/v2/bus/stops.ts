/**
 * GET /api/v2/bus/stops
 *
 * 利用可能なバス停一覧を取得する。
 * 国際興業バス・西武バスの両社のバス停を統合して返す。
 *
 * クエリパラメータ:
 *   - company (任意): バス会社コード ("KokusaiKogyo" | "Seibu")
 *
 * レスポンス: UnifiedBusStop[]
 */

import Bus from "@@/shared/utils/Bus/v2";
import type { BusCompanyCode } from "@@/shared/types/bus";

export default defineEventHandler((event) => {
  const query = getQuery(event) as { [K: string]: string };
  const { company } = query;

  // バリデーション: company が指定された場合は有効な値かチェック
  if (company && company !== "KokusaiKogyo" && company !== "Seibu") {
    throw createError({
      statusCode: 400,
      data: "クエリパラメータ 'company' は 'KokusaiKogyo' または 'Seibu' を指定してください。",
    });
  }

  return Bus.getStops((company as BusCompanyCode) || undefined);
});

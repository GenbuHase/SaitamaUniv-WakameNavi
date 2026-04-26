/**
 * GET /api/v2/bus/routes
 *
 * バス路線情報を取得する。
 *
 * クエリパラメータ:
 *   - start (任意): 出発バス停のnavitime IDでフィルタ
 *   - goal (任意): 到着バス停のnavitime IDでフィルタ
 *   - company (任意): バス会社コード ("KokusaiKogyo" | "Seibu")
 *
 * レスポンス: BusRoute[]
 */

import Bus from "@@/shared/utils/Bus/v2";
import type { BusCompanyCode } from "@@/shared/types/bus";

export default defineEventHandler((event) => {
  const query = getQuery(event) as { [K: string]: string };
  const { start, goal, company } = query;

  // バリデーション: company が指定された場合は有効な値かチェック
  if (company && company !== "KokusaiKogyo" && company !== "Seibu") {
    throw createError({
      statusCode: 400,
      data: "クエリパラメータ 'company' は 'KokusaiKogyo' または 'Seibu' を指定してください。",
    });
  }

  return Bus.getRoutes({
    companyCode: (company as BusCompanyCode) || undefined,
    startId: start || undefined,
    goalId: goal || undefined,
  });
});

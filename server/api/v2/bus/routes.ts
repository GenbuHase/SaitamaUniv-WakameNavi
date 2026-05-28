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
import {
  isValidBusStopId,
  isValidCompanyCode,
  safeGetString,
} from "../../../utils/validation";

export default defineEventHandler((event) => {
  const rawQuery = getQuery(event);

  // 安全な文字列としてパラメータを取得
  const start = safeGetString(rawQuery.start);
  const goal = safeGetString(rawQuery.goal);
  const company = safeGetString(rawQuery.company);

  // バリデーション: company が指定された場合は有効な値かチェック
  if (company && !isValidCompanyCode(company)) {
    throw createError({
      statusCode: 400,
      data: "クエリパラメータ 'company' は 'KokusaiKogyo' または 'Seibu' を指定してください。",
    });
  }

  // バス停IDのバリデーション (ホワイトリスト照合)
  if (start && !isValidBusStopId(start)) {
    throw createError({
      statusCode: 400,
      data: "無効な出発バス停IDです。",
    });
  }

  if (goal && !isValidBusStopId(goal)) {
    throw createError({
      statusCode: 400,
      data: "無効な到着バス停IDです。",
    });
  }

  return Bus.getRoutes({
    companyCode: (company as BusCompanyCode) || undefined,
    startId: start || undefined,
    goalId: goal || undefined,
  });
});

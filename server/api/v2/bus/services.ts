/**
 * GET /api/v2/bus/services
 *
 * バスの運行情報 (リアルタイム位置情報) を取得する。
 *
 * クエリパラメータ:
 *   - start (必須): 出発バス停コード (例: "SaitamaUniv")
 *   - goal (任意): 到着バス停コード (例: "KitaUrawa")
 *   - company (任意): バス会社コード ("KokusaiKogyo" | "Seibu")
 *
 * レスポンス: BusService[]
 */

import Bus from "@@/shared/utils/Bus/v2";
import type { BusCompanyCode } from "@@/shared/types/bus";

export default defineEventHandler(async (event) => {
  const query = getQuery(event) as { [K: string]: string };
  const { start, goal, company } = query;

  // バリデーション: start は必須
  if (!start) {
    throw createError({
      statusCode: 400,
      data: "クエリパラメータ 'start' は必須です。",
    });
  }

  // バリデーション: company が指定された場合は有効な値かチェック
  if (company && company !== "KokusaiKogyo" && company !== "Seibu") {
    throw createError({
      statusCode: 400,
      data: "クエリパラメータ 'company' は 'KokusaiKogyo' または 'Seibu' を指定してください。",
    });
  }

  const companyCode = (company as BusCompanyCode) || null;

  return await Bus.getServices(companyCode, start, goal || undefined);
});

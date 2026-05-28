/**
 * GET /api/v2/bus/services
 *
 * バスの運行情報 (リアルタイム位置情報) を取得する。
 *
 * クエリパラメータ:
 *   - start (任意): 出発バス停コード (例: "SaitamaUniv")
 *   - goal (任意): 到着バス停コード (例: "KitaUrawa")
 *   - company (任意): バス会社コード ("KokusaiKogyo" | "Seibu")
 *   - kokusaiStartId (任意): 国際興業バスの出発バス停ID (8桁数字)
 *   - kokusaiGoalId (任意): 国際興業バスの到着バス停ID (8桁数字)
 *   - seibuStartId (任意): 西武バスの出発バス停ID (8桁数字)
 *   - seibuGoalId (任意): 西武バスの到着バス停ID (8桁数字)
 *
 * レスポンス: BusService[]
 */

import Bus from "@@/shared/utils/Bus/v2";
import type { BusCompanyCode } from "@@/shared/types/bus";
import {
  isValidKokusaiId,
  isValidSeibuId,
  isValidCompanyCode,
  isValidStopCode,
  safeGetString,
} from "../../../utils/validation";

/** services API で使用するクエリパラメータのホワイトリスト */
const ALLOWED_PARAMS = new Set([
  "start", "goal", "company",
  "kokusaiStartId", "kokusaiGoalId",
  "seibuStartId", "seibuGoalId",
]);

export default defineCachedEventHandler(
  async event => {
    const rawQuery = getQuery(event);

    // ホワイトリストにないパラメータを除去した安全なクエリを構築
    const start = safeGetString(rawQuery.start);
    const goal = safeGetString(rawQuery.goal);
    const company = safeGetString(rawQuery.company);
    const kokusaiStartId = safeGetString(rawQuery.kokusaiStartId);
    const kokusaiGoalId = safeGetString(rawQuery.kokusaiGoalId);
    const seibuStartId = safeGetString(rawQuery.seibuStartId);
    const seibuGoalId = safeGetString(rawQuery.seibuGoalId);

    // 新しい直接ID指定方式 (自由にバス停を選択できるようにする)
    if (kokusaiStartId || seibuStartId) {
      const services = [];

      // 国際興業バス: IDホワイトリストバリデーション
      if (kokusaiStartId) {
        if (!isValidKokusaiId(kokusaiStartId)) {
          throw createError({
            statusCode: 400,
            data: "無効な国際興業バスの出発バス停IDです。",
          });
        }
        if (kokusaiGoalId && !isValidKokusaiId(kokusaiGoalId)) {
          throw createError({
            statusCode: 400,
            data: "無効な国際興業バスの到着バス停IDです。",
          });
        }

        try {
          services.push(...(await Bus.KokusaiKogyoBus.getServices(kokusaiStartId, kokusaiGoalId || kokusaiStartId)));
        } catch (e) {
          console.error("[KokusaiKogyoBus] 運行情報の取得に失敗:", e);
        }
      }

      // 西武バス: IDホワイトリストバリデーション
      if (seibuStartId) {
        if (!isValidSeibuId(seibuStartId)) {
          throw createError({
            statusCode: 400,
            data: "無効な西武バスの出発バス停IDです。",
          });
        }
        if (seibuGoalId && !isValidSeibuId(seibuGoalId)) {
          throw createError({
            statusCode: 400,
            data: "無効な西武バスの到着バス停IDです。",
          });
        }

        try {
          services.push(...(await Bus.SeibuBus.getServices(seibuStartId, seibuGoalId || seibuStartId)));
        } catch (e) {
          console.error("[SeibuBus] 運行情報の取得に失敗:", e);
        }
      }

      return services;
    }

    // バリデーション: start または直接ID は必須
    if (!start) {
      throw createError({
        statusCode: 400,
        data: "クエリパラメータ 'start' または各社の 'startId' が必要です。"
      });
    }

    // バス停コードのバリデーション
    if (!isValidStopCode(start)) {
      throw createError({
        statusCode: 400,
        data: "無効な出発バス停コードです。"
      });
    }

    if (goal && !isValidStopCode(goal)) {
      throw createError({
        statusCode: 400,
        data: "無効な到着バス停コードです。"
      });
    }

    // バス会社コードのバリデーション
    if (company && !isValidCompanyCode(company)) {
      throw createError({
        statusCode: 400,
        data: "クエリパラメータ 'company' は 'KokusaiKogyo' または 'Seibu' を指定してください。"
      });
    }

    const companyCode = (company as BusCompanyCode) || null;

    return await Bus.getServices(companyCode, start, goal || undefined);
  },
  {
    name: "v2_bus_services",
    maxAge: 60,

    getKey: event => {
      // ホワイトリストに含まれるパラメータのみでキャッシュキーを生成する
      // これにより、不正なパラメータによるキャッシュポイズニングを防止する
      const rawQuery = getQuery(event);
      const keyParts: string[] = [];

      for (const param of ALLOWED_PARAMS) {
        const value = safeGetString(rawQuery[param]);
        if (value) {
          keyParts.push(`${param}=${value}`);
        }
      }

      // パラメータをソートして順序によらず同一のキャッシュキーを生成
      return keyParts.sort().join("&");
    }
  }
);

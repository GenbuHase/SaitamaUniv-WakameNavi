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

export default defineCachedEventHandler(
  async event => {
    const query = getQuery(event) as { [K: string]: string };
    const { start, goal, company, kokusaiStartId, kokusaiGoalId, seibuStartId, seibuGoalId } = query;

    // 新しい直接ID指定方式 (自由にバス停を選択できるようにする)
    if (kokusaiStartId || seibuStartId) {
      const services = [];
      if (kokusaiStartId) {
        try {
          services.push(...(await Bus.KokusaiKogyoBus.getServices(kokusaiStartId, kokusaiGoalId || kokusaiStartId)));
        } catch (e) {
          console.error("[KokusaiKogyoBus] 運行情報の取得に失敗:", e);
        }
      }
      if (seibuStartId) {
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

    // 従来の内部コード指定方式
    if (company && company !== "KokusaiKogyo" && company !== "Seibu") {
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
      // パラメータの順序に関わらず同一のキャッシュを利用可能にするため、キーをソートする
      const query = getQuery(event) as { [K: string]: string };
      const keys = Object.keys(query).sort();

      return keys.map(k => `${k}=${query[k]}`).join("&");
    }
  }
);

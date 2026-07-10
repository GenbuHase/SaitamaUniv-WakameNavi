/**
 * GET /api/v2/bus/services
 *
 * バスの運行情報 (リアルタイム位置情報) を取得する。
 *
 * クエリパラメータ:
 *   - kokusaiStartId (任意): 国際興業バスの出発バス停ID (8桁数字)
 *   - kokusaiGoalId (任意): 国際興業バスの到着バス停ID (8桁数字)
 *   - seibuStartId (任意): 西武バスの出発バス停ID (8桁数字)
 *   - seibuGoalId (任意): 西武バスの到着バス停ID (8桁数字)
 *
 * kokusaiStartId / seibuStartId の少なくとも一方が必要。
 *
 * レスポンス: BusService[]
 *
 * キャッシュ方針:
 *   Redis (Upstash) のみを共有キャッシュとして使用する (TTL 60秒)。
 *   Redis 未設定時 (ローカル開発など) はキャッシュなしで都度取得する。
 */

import Bus from "@@/shared/utils/Bus/v2";

import { redis, hasRedis } from "../../../utils/redis";

import {
  isValidKokusaiId,
  isValidSeibuId,
  safeGetString,
} from "../../../utils/validation";

import type { BusService } from "@@/shared/types/bus";

/** services API で使用するクエリパラメータのホワイトリスト */
const ALLOWED_PARAMS = new Set([
  "kokusaiStartId", "kokusaiGoalId",
  "seibuStartId", "seibuGoalId",
]);

/** Redis キャッシュ TTL (秒) */
const CACHE_TTL_SECONDS = 60;

/** ホワイトリストパラメータから安全なキャッシュキーを生成する */
function buildCacheKey(rawQuery: Record<string, unknown>): string {
  const keyParts: string[] = [];
  for (const param of ALLOWED_PARAMS) {
    const value = safeGetString(rawQuery[param]);
    if (value) {
      keyParts.push(`${param}=${value}`);
    }
  }
  return `bus_services:${keyParts.sort().join("&")}`;
}

export default defineEventHandler(async event => {
  const rawQuery = getQuery(event);

  const kokusaiStartId = safeGetString(rawQuery.kokusaiStartId);
  const kokusaiGoalId = safeGetString(rawQuery.kokusaiGoalId);
  const seibuStartId = safeGetString(rawQuery.seibuStartId);
  const seibuGoalId = safeGetString(rawQuery.seibuGoalId);

  const cacheKey = buildCacheKey(rawQuery as Record<string, unknown>);

  // 1. Redis 共有キャッシュの確認
  if (hasRedis && redis) {
    try {
      const cached = await redis.get<string | BusService[]>(cacheKey);

      if (cached) {
        return typeof cached === "string" ? (JSON.parse(cached) as BusService[]) : cached;
      }
    } catch (e) {
      console.error("[Redis Cache] 読み込みに失敗 (キャッシュなしで継続):", e);
    }
  }

  // 2. 実際の運行データ取得
  const fetchServices = async (): Promise<BusService[]> => {
    if (!kokusaiStartId && !seibuStartId) {
      throw createError({
        statusCode: 400,
        data: "クエリパラメータ 'kokusaiStartId' または 'seibuStartId' が必要です。",
      });
    }

    const services: BusService[] = [];

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
  };

  const result = await fetchServices();

  // 3. Redis に結果を書き込み
  if (hasRedis && redis && result && result.length > 0) {
    try {
      await redis.set(cacheKey, JSON.stringify(result), { ex: CACHE_TTL_SECONDS });
    } catch (e) {
      console.error("[Redis Cache] 書き込みに失敗:", e);
    }
  }

  return result;
});

/**
 * 西武バス スクレイパー (v2)
 *
 * NAVITIME バスロケーションサイト (transfer-cloud.navitime.biz/seibubus) から
 * 西武バスの運行情報を取得し、共通の BusService 型に正規化して返す。
 */

import type { BusCompanyCode, BusService } from "@@/shared/types/bus";
import { BUS_COMPANIES } from "@@/shared/types/bus";
import { fetchNavitimeCloudServices } from "@@/shared/utils/Bus/v2/NavitimeCloud";

/** テナントコード */
const TENANT_CODE = "seibubus" as const;

/** バス会社コード */
export const COMPANY_CODE: BusCompanyCode = "Seibu";

/** バス会社名 */
export const COMPANY_NAME = BUS_COMPANIES.Seibu.name;

/**
 * 西武バスの運行情報を取得する
 *
 * @param startId - 出発バス停の navitime ID
 * @param goalId - 到着バス停の navitime ID
 * @returns 正規化された運行情報の配列
 */
export async function getServices(startId: string, goalId: string): Promise<BusService[]> {
  return fetchNavitimeCloudServices({
    tenant: TENANT_CODE,
    companyCode: COMPANY_CODE,
    companyName: COMPANY_NAME,
    startId,
    goalId,
  });
}

export default {
  COMPANY_CODE,
  COMPANY_NAME,
  getServices,
};


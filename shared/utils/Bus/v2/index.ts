/**
 * バスユーティリティ 統合エントリポイント (v2)
 *
 * 国際興業バス・西武バスのスクレイパーと路線マスタへのアクセスを提供する。
 * 運行情報の取得は各社モジュール (KokusaiKogyoBus / SeibuBus) を直接呼び出す。
 */

import * as KokusaiKogyoBus from "./KokusaiKogyoBus";
import * as SeibuBus from "./SeibuBus";
import Routes, {
  KokusaiKogyoStops,
  SeibuStops,
  BusStopsByCompany,
  findBusStopByCode,
  getCompaniesForStop,
} from "./Routes";

const BusStops = {
  KokusaiKogyo: KokusaiKogyoStops,
  Seibu: SeibuStops,
  BusStopsByCompany,
  findBusStopByCode,
  getCompaniesForStop,
};

const Bus = {
  BusStops,
  Routes,
  KokusaiKogyoBus,
  SeibuBus,
  findBusStopByCode,
  getCompaniesForStop,
} as const;

export default Bus;

export {
  BusStops,
  Routes,
  KokusaiKogyoBus,
  SeibuBus,
  findBusStopByCode,
  getCompaniesForStop,
};

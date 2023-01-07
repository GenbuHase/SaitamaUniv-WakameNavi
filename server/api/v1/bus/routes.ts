// /api/v1/bus/routes?company=:company(Seibu|KokusaiKogyo)&start=:start&goal=:goal?

import Bus from "~~/utils/Trasportation/Bus";

const { KokusaiKogyo, Seibu } = Bus;

export default defineEventHandler(async event => {
  const KK_BUS_STOPS = KokusaiKogyo.BUS_STOPS;
  const SEIBU_BUS_STOPS = Seibu.BUS_STOPS;

  const { company, start, goal } = getQuery(event);

  // ToDo: 国際興業バス・西武バスにそれぞれバス停が存在するかを調べる関数

  let routes: Bus.Route[] = [];
  switch (company) {
    default:
      routes.push(...await KokusaiKogyo.getRoutes(KK_BUS_STOPS[start as keyof typeof KK_BUS_STOPS].id, KK_BUS_STOPS[goal as keyof typeof KK_BUS_STOPS].id));
      routes.push(...await Seibu.getRoutes(SEIBU_BUS_STOPS[start as keyof typeof SEIBU_BUS_STOPS].id, SEIBU_BUS_STOPS[goal as keyof typeof SEIBU_BUS_STOPS].id));
      break;

    case KokusaiKogyo.COMPANY_CODE:
      routes.push(...await KokusaiKogyo.getRoutes(KK_BUS_STOPS[start as keyof typeof KK_BUS_STOPS].id, KK_BUS_STOPS[goal as keyof typeof KK_BUS_STOPS].id));
      break;

    case Seibu.COMPANY_CODE:
      routes.push(...await Seibu.getRoutes(SEIBU_BUS_STOPS[start as keyof typeof SEIBU_BUS_STOPS].id, SEIBU_BUS_STOPS[goal as keyof typeof SEIBU_BUS_STOPS].id));
      break;
  }

  return routes;
});
// /api/v1/bus/routes?company=:company(Seibu|KokusaiKogyo)&start=:start&goal=:goal?

import Bus from "@/utils/Trasportation/Bus";

const { KokusaiKogyo, Seibu } = Bus;

export default defineEventHandler(async event => {
  const KK_BUS_STOPS = KokusaiKogyo.BUS_STOPS;
  const SEIBU_BUS_STOPS = Seibu.BUS_STOPS;

  const { company, start, goal } = getQuery(event) as { [K: string]: string };

  const validity = Bus.checkValidityOfBusStopCode(company, start, goal);

  const routes: Bus.Route[] = [];
  switch (company) {
    default:
      if (validity.KokusaiKogyo.start && validity.KokusaiKogyo.goal) routes.push(...await KokusaiKogyo.getRoutes(KK_BUS_STOPS[start as keyof typeof KK_BUS_STOPS].id, KK_BUS_STOPS[goal as keyof typeof KK_BUS_STOPS].id));
      if (validity.Seibu.start && validity.Seibu.goal) routes.push(...await Seibu.getRoutes(SEIBU_BUS_STOPS[start as keyof typeof SEIBU_BUS_STOPS].id, SEIBU_BUS_STOPS[goal as keyof typeof SEIBU_BUS_STOPS].id));

      break;

    case KokusaiKogyo.COMPANY_CODE:
      if (validity.KokusaiKogyo.start && validity.KokusaiKogyo.goal) routes.push(...await KokusaiKogyo.getRoutes(KK_BUS_STOPS[start as keyof typeof KK_BUS_STOPS].id, KK_BUS_STOPS[goal as keyof typeof KK_BUS_STOPS].id));
      break;

    case Seibu.COMPANY_CODE:
      if (validity.Seibu.start && validity.Seibu.goal) routes.push(...await Seibu.getRoutes(SEIBU_BUS_STOPS[start as keyof typeof SEIBU_BUS_STOPS].id, SEIBU_BUS_STOPS[goal as keyof typeof SEIBU_BUS_STOPS].id));
      break;
  }

  return routes;
});
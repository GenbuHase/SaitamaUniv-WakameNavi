// /api/v1/bus/services?company=:company?(Seibu|KokusaiKogyo)&start=:start&goal=:goal?

import Bus from "@/utils/Bus";

const { BusStops, KokusaiKogyoBus, SeibuBus } = Bus;

export default defineEventHandler(async event => {
  const { company, start, goal } = getQuery(event) as { [K: string]: string };

  return await Services.getServices(company, start, goal);
});

export namespace Services {
  export async function getServices (company: string, start: string, goal: string) {
    if (!start) {
      throw createError({
        statusCode: 400,
        data: "A query-parameter 'start' is required."
      });
    }
  
    const validity = Bus.Route.checkValidityOfBusStop(company, start, goal);
    const services: Bus.Service[] = [];
  
    switch (company) {
      default:
        if (validity.KokusaiKogyo?.start && validity.KokusaiKogyo?.goal) services.push(...await KokusaiKogyoBus.Service.getServices(BusStops.KokusaiKogyo[start as keyof typeof BusStops.KokusaiKogyo].id, BusStops.KokusaiKogyo[goal as keyof typeof BusStops.KokusaiKogyo].id));
        if (validity.Seibu?.start && validity.Seibu?.goal) services.push(...await SeibuBus.Service.getServices(BusStops.Seibu[start as keyof typeof BusStops.Seibu].id, BusStops.Seibu[goal as keyof typeof BusStops.Seibu].id));
        break;
  
      case KokusaiKogyoBus.COMPANY_CODE:
        if (validity.KokusaiKogyo?.start && validity.KokusaiKogyo?.goal) services.push(...await KokusaiKogyoBus.Service.getServices(BusStops.KokusaiKogyo[start as keyof typeof BusStops.KokusaiKogyo].id, BusStops.KokusaiKogyo[goal as keyof typeof BusStops.KokusaiKogyo].id));
        break;
  
      case SeibuBus.COMPANY_CODE:
        if (validity.Seibu?.start && validity.Seibu?.goal) services.push(...await SeibuBus.Service.getServices(BusStops.Seibu[start as keyof typeof BusStops.Seibu].id, BusStops.Seibu[goal as keyof typeof BusStops.Seibu].id));
        break;
    }
  
    return services;
  }
}
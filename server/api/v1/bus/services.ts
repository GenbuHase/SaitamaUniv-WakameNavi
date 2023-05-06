import Bus from "@/utils/Bus";

const { KokusaiKogyoBus, SeibuBus } = Bus;

// /api/v1/bus/services?company=:company?(Seibu|KokusaiKogyo)&start=:start&goal=:goal?
export default defineEventHandler(async event => {
  const { company, start, goal } = getQuery(event) as { [K: string]: string };

  if (!start) {
    throw createError({
      statusCode: 400,
      data: "A query-parameter 'start' is required."
    });
  }

  return await Services.getServices(company, start, goal);
});

export namespace Services {
  export async function getServices (companyCode: string, startBusstopCode: string, goalBusstopCode?: string) {
    const validity = Bus.Route.checkValidityOfBusStop(companyCode, startBusstopCode, goalBusstopCode);
    const services: Bus.Service[] = [];
  
    switch (companyCode) {
      default:
        if (validity[KokusaiKogyoBus.COMPANY_CODE]?.start && validity[KokusaiKogyoBus.COMPANY_CODE]?.goal) services.push(...await KokusaiKogyoBus.Service.getServices(KokusaiKogyoBus.BUSSTOPS[startBusstopCode as keyof typeof KokusaiKogyoBus.BUSSTOPS].id, KokusaiKogyoBus.BUSSTOPS[goalBusstopCode as keyof typeof KokusaiKogyoBus.BUSSTOPS].id));
        if (validity[SeibuBus.COMPANY_CODE]?.start && validity[SeibuBus.COMPANY_CODE]?.goal) services.push(...await SeibuBus.Service.getServices(SeibuBus.BUSSTOPS[startBusstopCode as keyof typeof SeibuBus.BUSSTOPS].id, SeibuBus.BUSSTOPS[goalBusstopCode as keyof typeof SeibuBus.BUSSTOPS].id));
        break;
  
      case KokusaiKogyoBus.COMPANY_CODE:
        if (validity[KokusaiKogyoBus.COMPANY_CODE]?.start && validity[KokusaiKogyoBus.COMPANY_CODE]?.goal) services.push(...await KokusaiKogyoBus.Service.getServices(KokusaiKogyoBus.BUSSTOPS[startBusstopCode as keyof typeof KokusaiKogyoBus.BUSSTOPS].id, KokusaiKogyoBus.BUSSTOPS[goalBusstopCode as keyof typeof KokusaiKogyoBus.BUSSTOPS].id));
        break;
  
      case SeibuBus.COMPANY_CODE:
        if (validity[SeibuBus.COMPANY_CODE]?.start && validity[SeibuBus.COMPANY_CODE]?.goal) services.push(...await SeibuBus.Service.getServices(KokusaiKogyoBus.BUSSTOPS[startBusstopCode as keyof typeof KokusaiKogyoBus.BUSSTOPS].id, KokusaiKogyoBus.BUSSTOPS[goalBusstopCode as keyof typeof KokusaiKogyoBus.BUSSTOPS].id));
        break;
    }
  
    return services;
  }
}
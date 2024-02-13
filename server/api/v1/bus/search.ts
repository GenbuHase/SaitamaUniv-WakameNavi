import Bus from "@/utils/Bus";

const { KokusaiKogyoBus, SeibuBus } = Bus;

// /api/v1/bus/search?company=(Seibu|KokusaiKogyo)?&start=string
export default defineEventHandler(event => {
  const { company, start } = getQuery(event) as { [K: string]: string };

  if (!start) {
    throw createError({
      statusCode: 400,
      data: "A query-parameter 'start' is required."
    });
  }

  return Search.listBusstops(company, start);
});

export namespace Search {
  export function listBusstops (companyCode: string, startBusstopId: string) {
    const routes = [];

    switch (companyCode) {
      default:
        break;
  
      case KokusaiKogyoBus.COMPANY_CODE:
        routes.push(...KokusaiKogyoBus.Route.listBusstops(startBusstopId));
        break;
  
      case SeibuBus.COMPANY_CODE:
        break;
    }

    return routes;
  }
}
import Bus from "@/utils/Bus";

const { KokusaiKogyoBus, SeibuBus } = Bus;

// /api/v1/bus/routes?company=(Seibu|KokusaiKogyo)?&start=string&goal=string?
export default defineEventHandler(event => {
  const { company, start, goal } = getQuery(event) as { [K: string]: string };

  if (!start) {
    throw createError({
      statusCode: 400,
      data: "A query-parameter 'start' is required."
    });
  }

  return Routes.getRoutes(company, start, goal);
});

export namespace Routes {
  export function getRoutes (companyCode: string, startBusstopName: string, goalBusstopName?: string) {
    const routes = [];

    switch (companyCode) {
      default:
        routes.push(...Bus.Route.findRoutes(startBusstopName, goalBusstopName));
        break;
  
      case KokusaiKogyoBus.COMPANY_CODE:
        routes.push(...KokusaiKogyoBus.Route.findRoutes(startBusstopName, goalBusstopName));
        break;
  
      case SeibuBus.COMPANY_CODE:
        routes.push(...SeibuBus.Route.findRoutes(startBusstopName, goalBusstopName));
        break;
    }

    return routes;
  }
}
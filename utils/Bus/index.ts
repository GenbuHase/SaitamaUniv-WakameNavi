import KokusaiKogyoBus from "./KokusaiKogyoBus";
import SeibuBus from "./SeibuBus";

class Bus {
  public static readonly KokusaiKogyoBus = KokusaiKogyoBus;
  public static readonly SeibuBus = SeibuBus;

  public static readonly Service = class Service {
    public static async getServices (startBusstopId: string, goalBusstopId: string) {
      const services: Bus.Service[] = [];

      services.push(...await KokusaiKogyoBus.Service.getServices(startBusstopId, goalBusstopId));
      services.push(...await SeibuBus.Service.getServices(startBusstopId, goalBusstopId));

      return services;
    }
  }

  public static readonly Route = class Route {
    public static readonly ROUTES = {
      [KokusaiKogyoBus.COMPANY_CODE]: KokusaiKogyoBus.ROUTES,
      [SeibuBus.COMPANY_CODE]: SeibuBus.ROUTES
    }

    public static findRoutes (start: string, goal?: string) {
      const result = [];

      result.push(...KokusaiKogyoBus.Route.findRoutes(start, goal).map(route => `${KokusaiKogyoBus.COMPANY_CODE}:${route}`));
      result.push(...SeibuBus.Route.findRoutes(start, goal).map(route => `${SeibuBus.COMPANY_CODE}:${route}`));

      return result;
    }

    public static getParentsOfBusStop (busStopCode: string): (typeof KokusaiKogyoBus | typeof SeibuBus)[] {
      const parents = [];

      if (busStopCode in KokusaiKogyoBus.BUSSTOPS) parents.push(KokusaiKogyoBus);
      if (busStopCode in SeibuBus.BUSSTOPS) parents.push(SeibuBus);

      return parents;
    }

    public static checkValidityOfBusStop (companyCode: string | null, startBusStopCode: string, goalBusStopCode?: string): {[K in typeof KokusaiKogyoBus.COMPANY_CODE | typeof SeibuBus.COMPANY_CODE]?: { start: boolean, goal: boolean | null }} {
      function check (company: typeof KokusaiKogyoBus | typeof SeibuBus, startBusStopCode: string, goalBusStopCode?: string) {
        return {
          start: Boolean(startBusStopCode && Route.getParentsOfBusStop(startBusStopCode).includes(company)),
          goal: goalBusStopCode ? Boolean(goalBusStopCode && Route.getParentsOfBusStop(goalBusStopCode).includes(company)) : null
        }
      }
  
      const result: { [K in typeof KokusaiKogyoBus.COMPANY_CODE | typeof SeibuBus.COMPANY_CODE]?: { start: boolean, goal: boolean | null } } = {};
  
      switch (companyCode) {
        default:
          if (companyCode) {
            throw new Error(`A parameter, 'companyCode' must be '${KokusaiKogyoBus.COMPANY_CODE}' or '${SeibuBus.COMPANY_CODE}'.`);
          }

        case null:
          result[KokusaiKogyoBus.COMPANY_CODE] = check(KokusaiKogyoBus, startBusStopCode, goalBusStopCode);
          result[SeibuBus.COMPANY_CODE] = check(SeibuBus, startBusStopCode, goalBusStopCode);
          break;
  
        case KokusaiKogyoBus.COMPANY_CODE:
          result[companyCode] = check(KokusaiKogyoBus, startBusStopCode, goalBusStopCode);
          break;
  
        case SeibuBus.COMPANY_CODE:
          result[companyCode] = check(SeibuBus, startBusStopCode, goalBusStopCode);
          break;
      }
  
      return result;
    }
  }
}

namespace Bus {
  export type Service = {
    companyCode: string;
    
    route: string;
    destination: string;
    location: number;
    plannedTime: string;
    arrivalTime: string;
    delay: number;
  }

  export type Busstop = {
    id: string;
    name: string;
  }

  export type Route = Busstop[];
}

export default Bus;
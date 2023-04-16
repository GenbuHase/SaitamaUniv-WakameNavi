import BusStops from "./BusStops";
import Routes from "./Routes";
import KokusaiKogyoBus from "./KokusaiKogyoBus";
import SeibuBus from "./SeibuBus";

class Bus {
  public static readonly BusStops = BusStops;
  public static readonly Routes = Routes;

  public static readonly KokusaiKogyoBus = KokusaiKogyoBus;
  public static readonly SeibuBus = SeibuBus;

  public static readonly Service = class Service {
    public static async getServices (start: string, goal: string) {
      const services: Bus.Service[] = [];

      services.push(...await KokusaiKogyoBus.Service.getServices(start, goal));
      services.push(...await SeibuBus.Service.getServices(start, goal));

      return services;
    }
  }

  public static readonly Route = class Route {
    public static getParentsOfBusStop (busStopCode: string): (typeof KokusaiKogyoBus | typeof SeibuBus)[] {
      const parents = [];

      if (busStopCode in BusStops.KokusaiKogyo) parents.push(KokusaiKogyoBus);
      if (busStopCode in BusStops.Seibu) parents.push(SeibuBus);

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

  export type Route = {}
}

export default Bus;
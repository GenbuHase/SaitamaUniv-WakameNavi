import KokusaiKogyo from "./KokusaiKogyo";
import Seibu from "./Seibu";

class Bus {
  public static readonly KokusaiKogyo = KokusaiKogyo;
  public static readonly Seibu = Seibu;

  public static getParentOfBusStop (busStopCode: string) {
    const result = [];

    if (busStopCode in KokusaiKogyo.BUS_STOPS) result.push(KokusaiKogyo);
    if (busStopCode in Seibu.BUS_STOPS) result.push(Seibu);

    return result;
  }

  public static checkValidityOfBusStopCode (companyCode: string, startBusStopCode: string, goalBusStopCode?: string) {
    function check (company: typeof KokusaiKogyo | typeof Seibu, startBusStopCode: string, goalBusStopCode?: string) {
      return {
        start: Boolean(startBusStopCode && Bus.getParentOfBusStop(startBusStopCode).includes(company)),
        goal: Boolean(goalBusStopCode && Bus.getParentOfBusStop(goalBusStopCode).includes(company))
      }
    }

    let result: { [K: string]: { start: boolean, goal: boolean } } = {};

    switch (companyCode) {
      default:
        if (companyCode) throw new Error("A parameter, 'companyCode' must be 'KokusaiKogyo' or 'Seibu'.");

        result[KokusaiKogyo.COMPANY_CODE] = check(KokusaiKogyo, startBusStopCode, goalBusStopCode);
        result[Seibu.COMPANY_CODE] = check(Seibu, startBusStopCode, goalBusStopCode);
        break;

      case KokusaiKogyo.COMPANY_CODE:
        result[companyCode] = check(KokusaiKogyo, startBusStopCode, goalBusStopCode);
        break;

      case Seibu.COMPANY_CODE:
        result[companyCode] = check(Seibu, startBusStopCode, goalBusStopCode);
        break;
    }

    return result;
  }
}

namespace Bus {
  export type BusStop = {
    id: string;
    code: string;
    name: string;
  }
  
  export type Service = {
    companyCode: typeof KokusaiKogyo.COMPANY_CODE | typeof Seibu.COMPANY_CODE;
    
    route: string;
    destination: string;
    location: number;
    plannedTime: string;
    arrivalTime: string;
    delay: number;
  }
  
  export type Route = {
    companyCode: typeof KokusaiKogyo.COMPANY_CODE | typeof Seibu.COMPANY_CODE;
  
    name: string;
    start: BusStop;
    goal: BusStop;
    via: BusStop[];
  }
}

export default Bus;
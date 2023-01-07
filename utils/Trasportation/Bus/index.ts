import BusStop from "./BusStop";
import KokusaiKogyoNamespace from "./KokusaiKogyo";
import SeibuNamespace from "./Seibu";

namespace Bus {
  export type BusStopParameter = {
    id: string;
    code: string;
    name: string;
  }

  export type Service = {
    companyCode: typeof KokusaiKogyoNamespace.COMPANY_CODE | typeof SeibuNamespace.COMPANY_CODE;
    
    route: string;
    destination: string;
    location: number;
    plannedTime: string;
    arrivalTime: string;
    delay: number;
  }

  export type Route = {
    companyCode: typeof KokusaiKogyoNamespace.COMPANY_CODE | typeof SeibuNamespace.COMPANY_CODE;

    name: string;
    start: BusStop;
    goal: BusStop;
    via: BusStop[];
  }

  export const KokusaiKogyo = KokusaiKogyoNamespace;
  export const Seibu = SeibuNamespace;
}

export default Bus;
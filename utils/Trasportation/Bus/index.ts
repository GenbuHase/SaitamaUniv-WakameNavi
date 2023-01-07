import KokusaiKogyo from "./KokusaiKogyo";
import Seibu from "./Seibu";

class Bus {
  public static readonly KokusaiKogyo = KokusaiKogyo;
  public static readonly Seibu = Seibu;
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
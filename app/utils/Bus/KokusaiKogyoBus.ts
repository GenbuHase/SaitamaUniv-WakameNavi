import { JSDOM } from "jsdom";

import Bus from ".";
import Time from "@/utils/Time";

namespace KokusaiKogyoBus {
  export const COMPANY_CODE = "KokusaiKogyo";
  export const COMPANY_NAME = "国際興業バス";

  export class Service {
    public static async getServices (startId: string, goalId: string): Promise<Bus.Service[]> {
      const document = (await JSDOM.fromURL(this.__getFetchUrl(startId, goalId))).window.document;
      const elements = document.querySelectorAll("#resultList > .plotList");
  
      const services: Bus.Service[] = [];
      for (const elem of elements) {
        const route: string = elem.querySelector(".courseName")?.textContent || "";
        const destination: string = elem.querySelector(".destination-name")?.textContent || "";
        const destinationUnit: string = elem.querySelector(".destination-unit")?.textContent || "";
        const location: string = elem.querySelector(".approach-number")?.textContent || "";
        const delay: string = elem.querySelector(".delay-minutes-area > .middleText")?.textContent || "";
        const plannedTime: string = elem.querySelector(".on-time")?.textContent || "";

        services.push(
          this.__normalize({ route, destination, destinationUnit, location, delay, plannedTime })
        );
      }

      return services;
    }

    private static readonly FETCH_BASE_URL = "https://transfer.navitime.biz/5931bus/pc/location/BusLocationResult";

    private static __getFetchUrl = (startId: string, goalId: string) => `${this.FETCH_BASE_URL}?startId=${startId}&goalId=${goalId}`;

    private static __normalize (unnormalizedService: KokusaiKogyoBus.Service.UnnormalizedService): Bus.Service {
      const companyCode = KokusaiKogyoBus.COMPANY_CODE;

      const route: string = unnormalizedService.route;
      const destination: string = unnormalizedService.destination.replace(unnormalizedService.destinationUnit, "");

      const location: number = (() => {
        const locationContent = unnormalizedService.location;
        const locationMatcher = locationContent.match(/(\d+)個前/);

        if (locationContent === "始発バス停出発前") return 100;
        if (locationContent === "まもなく到着いたします") return 1;
        return locationMatcher ? parseInt(locationMatcher[1]) : 0;
      })();

      const delay: number = (() => {
        const delayContent = unnormalizedService.delay;
        const delayMatcher = delayContent.match(/(\d+)分/);

        if (delayContent === "遅れなし") return 0;
        return delayMatcher ? parseInt(delayMatcher[1]) : 0;
      })();

      const plannedTime: string = unnormalizedService.plannedTime;

      const arrivalTime: string = Time.parseDateToTimeString(
        Time.addMinutes(
          Time.parseTimeStringToDate(plannedTime), delay
        )
      );

      return {
        companyCode,
        
        route,
        destination,
        location,
        plannedTime,
        arrivalTime,
        delay
      }
    }
  }

  export namespace Service {
    export type UnnormalizedService = {
      route: string;
      destination: string;
      destinationUnit: string;
      location: string;
      delay: string;
      plannedTime: string;
    }
  }
}

export default KokusaiKogyoBus;
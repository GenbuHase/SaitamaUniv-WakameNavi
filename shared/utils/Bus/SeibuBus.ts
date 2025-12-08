import { JSDOM } from "jsdom";

import Bus from ".";
import Time from "@@/shared/utils/Time";

namespace SeibuBus {
  export const COMPANY_CODE = "Seibu";
  export const COMPANY_NAME = "西武バス";

  export class Service {
    public static async getServices (startId: string, goalId: string): Promise<Bus.Service[]> {
      const document = (await JSDOM.fromURL(this.__getFetchUrl(startId, goalId))).window.document;
      const elements = document.querySelectorAll("#resultList > .plotList");
  
      const services: Bus.Service[] = [];
      for (const elem of elements) {
        const route: string = elem.querySelector(".courseName")?.textContent || "";
        const destination: string = elem.querySelector(".destination-name")?.textContent || "";
        const location: Element | null = elem.querySelector(".locationClass") || null;
        const plannedTime: string = elem.querySelector(".plannedTime")?.textContent || "";
        const arrivalTime: string = elem.querySelector(".predictionTime")?.textContent || "";

        services.push(
          this.__normalize({
            route,
            destination,
            location,
            plannedTime,
            arrivalTime
          })
        );
      }

      return services;
    }

    private static readonly FETCH_BASE_URL = "https://transfer.navitime.biz/seibubus-dia/pc/location/BusLocationResult";

    private static __getFetchUrl = (startId: string, goalId: string) => `${this.FETCH_BASE_URL}?startId=${startId}&goalId=${goalId}`;

    private static __normalize (unnormalizedService: SeibuBus.Service.UnnormalizedService): Bus.Service {
      const companyCode = SeibuBus.COMPANY_CODE;

      const route: string = unnormalizedService.route.replace(/[０-９]/g, str => String.fromCharCode(str.charCodeAt(0) - 0xFEE0)).slice(1, -1);;
      const destination: string = unnormalizedService.destination.split("～")[1].slice(0, -1);

      const location: number = (() => {
        const { className } = unnormalizedService.location || { className: "" };
        const classMatcher = className.match(/position-(\d)/);

        return classMatcher ? parseInt(classMatcher[1]) : 100;
      })();

      const plannedTime: string = (() => {
        const timeMatcher = unnormalizedService.plannedTime.match(/\d{1,2}:\d{1,2}/);
        return timeMatcher ? timeMatcher[0] : "";
      })();
      
      const arrivalTime: string = (() => {
        const timeMatcher = unnormalizedService.arrivalTime.match(/\d{1,2}:\d{1,2}/);
        return timeMatcher ? timeMatcher[0] : "";
      })();

      const delay: number = Time.getDifferenceInMinutes(
        Time.parseTimeStringToDate(arrivalTime),
        Time.parseTimeStringToDate(plannedTime)
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
      location: Element | null;
      plannedTime: string;
      arrivalTime: string;
    }
  }
}

export default SeibuBus;
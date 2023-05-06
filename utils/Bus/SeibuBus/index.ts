import { JSDOM } from "jsdom";

import Bus from "..";
import Busstops from "./Busstops";
import Routes from "./Routes";
import Time from "@/utils/Time";

namespace SeibuBus {
  export const COMPANY_CODE = "Seibu";
  export const COMPANY_NAME = "西武バス";
  export const BUSSTOPS = Busstops;
  export const ROUTES: { [K in keyof typeof Routes]: Bus.Route } = Routes;



  export class Busstop {
    public static findById (busstopId: string) {
      for (const busstops of Object.values(ROUTES)) {
        if (busstops.some(busstop => busstop.id === busstopId)) {
          return busstops.find(busstop => busstop.id === busstopId) as Bus.Busstop;
        }
      }
    }


    public static findByName (busstopName: string) {
      for (const busstops of Object.values(ROUTES)) {
        if (busstops.some(busstop => busstop.name === busstopName)) {
          return busstops.find(busstop => busstop.name === busstopName) as Bus.Busstop;
        }
      }
    }
  }



  export class Route {
    public static findRoutes (startBusstopName: string, goalBusstopName?: string): Array<keyof typeof ROUTES> {
      const result: Array<keyof typeof ROUTES> = [];

      for (const [routeName, busstops] of Object.entries(ROUTES)) {
        if (
          busstops.some(busstop => busstop.name === startBusstopName) &&
          (!goalBusstopName ? true : busstops.some(busstop => busstop.name === goalBusstopName))
        ) {
          result.push(routeName as keyof typeof ROUTES);
        }
      }

      return result;
    }

    public static getBusstopsById (busstopId: string) {
      const result: { [K: string]: Bus.Busstop } = {};

      for (const [routeName, busstops] of Object.entries(ROUTES)) {
        if (busstops.some(busstop => busstop.id === busstopId)) {
          result[routeName] = busstops.find(busstop => busstop.id === busstopId) as Bus.Busstop;
        }
      }

      return result;
    }

    public static getBusstopsByName (busstopName: string) {
      const result: { [K: string]: Bus.Busstop } = {};

      for (const [routeName, busstops] of Object.entries(ROUTES)) {
        if (busstops.some(busstop => busstop.name === busstopName)) {
          result[routeName] = busstops.find(busstop => busstop.name === busstopName) as Bus.Busstop;
        }
      }

      return result;
    }

    public static isValid (startBusStopId: string, goalBusstopId?: string) {
      const startSortedBusstops = this.getBusstopsById(startBusStopId);

      if (Object.keys(startBusStopId).length === 0) return false;

      if (goalBusstopId) {
        const goalSortedBusstops = this.getBusstopsById(goalBusstopId);

        if (Object.keys(goalSortedBusstops).length === 0) return false;

        for (const [routeName, startBusstop] of Object.entries(startSortedBusstops)) {
          if (routeName in goalSortedBusstops) {
            const goalBusstop = goalSortedBusstops[routeName];
            const startIndex = ROUTES[routeName].indexOf(startBusstop);
            const goalIndex = ROUTES[routeName].indexOf(goalBusstop);

            if (startIndex < goalIndex) return true;
          }
        }

        return false;
      }

      return true;
    }
  }



  export class Service {
    public static async getServices (startBusstopId: string, goalBusstopId: string): Promise<Bus.Service[]> {
      const document = (await JSDOM.fromURL(this.__getFetchUrl(startBusstopId, goalBusstopId))).window.document;
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

    private static readonly __FETCH_BASE_URL = "https://transfer.navitime.biz/seibubus-dia/pc/location/BusLocationResult";

    private static __getFetchUrl = (startId: string, goalId: string) => `${this.__FETCH_BASE_URL}?startId=${startId}&goalId=${goalId}`;

    private static __normalize (unnormalizedService: Service.UnnormalizedService): Bus.Service {
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
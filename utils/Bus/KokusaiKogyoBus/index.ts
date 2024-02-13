import { JSDOM } from "jsdom";

import Bus from "..";
import Busstops from "./Busstops";
import Routes from "./Routes";
import Time from "@/utils/Time";

namespace KokusaiKogyoBus {
  export const COMPANY_CODE = "KokusaiKogyo";
  export const COMPANY_NAME = "国際興業バス";
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

    public static listBusstops (startBusstopId: string) {
      const result: Bus.Busstop[] = [];

      for (const routeName in ROUTES) {
        const route = ROUTES[routeName as keyof typeof ROUTES];

        if (route.find(busstop => busstop.id === startBusstopId)) {
          result.push(...route.filter(busstop => busstop.id !== startBusstopId));
        }
      }

      return result.filter((busstop1, i, _) => {
        return _.findIndex(busstop2 => busstop2.id === busstop1.id) === i
      });
    }

    /*public static listBusstops (startBusstopName: string) {
      const result: Bus.Busstop[] = [];

      for (const routeName in ROUTES) {
        const route = ROUTES[routeName as keyof typeof ROUTES];

        if (route.find(busstop => busstop.name === startBusstopName)) {
          result.push(...route.filter(busstop => busstop.name !== startBusstopName));
        }
      }

      return result.filter((busstop1, i, _) => {
        return _.findIndex(busstop2 => busstop2.id === busstop1.id) === i
      });
    }*/

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

    private static readonly __FETCH_BASE_URL = "https://transfer.navitime.biz/5931bus/pc/location/BusLocationResult";
    private static readonly __DIAGRAM_BASE_URL = "https://transfer.navitime.biz/5931bus/pc/diagram/BusCourseSearch";

    private static __getFetchUrl = (startId: string, goalId: string) => `${this.__FETCH_BASE_URL}?startId=${startId}&goalId=${goalId}`;
    private static __getDiagramUrl = (startId: string) => `${this.__DIAGRAM_BASE_URL}?busstopId=${startId}`;

    private static __normalize (unnormalizedService: Service.UnnormalizedService): Bus.Service {
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
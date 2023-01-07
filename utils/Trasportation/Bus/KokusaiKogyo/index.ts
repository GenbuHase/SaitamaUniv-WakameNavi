import { JSDOM } from "jsdom";
import TimeHandler from "~~/utils/TimeHandler";

import Bus from "..";
import BUS_STOPS from "./BusStops";
import ROUTES from "./Routes";

export default class KokusaiKogyo {
  public static readonly BASE_URL = "https://transfer.navitime.biz/5931bus/pc/location/BusLocationResult";

  public static readonly COMPANY_CODE = "KokusaiKogyo";
  public static readonly BUS_STOPS = BUS_STOPS;
  public static readonly ROUTES = ROUTES;



  private static __getFetchUrl = (startId: string, goalId: string) => `${KokusaiKogyo.BASE_URL}?startId=${startId}&goalId=${goalId}`;



  public static getRoutes (startId?: string, goalId?: string) {
    let routes = KokusaiKogyo.ROUTES;

    if (startId) {
      routes = routes.filter(route => {
        return route.start.id === startId || route.via.find(via => via.id === startId);
      });
    }

    if (goalId) {
      routes = routes.filter(route => {
        return route.goal.id === goalId || route.via.find(via => via.id === goalId);
      });
    }

    return routes;
  }

  public static async getServices (startId: typeof BUS_STOPS[keyof typeof BUS_STOPS]["id"], goalId: typeof BUS_STOPS[keyof typeof BUS_STOPS]["id"]): Promise<Bus.Service[]> {
    const dom = await JSDOM.fromURL(KokusaiKogyo.__getFetchUrl(startId, goalId));
    const document = dom.window.document;
    const buses = document.querySelectorAll("#resultList > .plotList");

    const services: Bus.Service[] = [];
    for (const bus of buses) {
      const route = bus.querySelector(".courseName").textContent;
      const destination = bus.querySelector(".destination-name").textContent.replace(bus.querySelector(".destination-unit").textContent, "");

      const location = (() => {
        const locationContent = bus.querySelector(".approach-number").textContent.trim();

        if (locationContent === "始発バス停出発前") return 100;
        if (locationContent === "まもなく到着いたします") return 1;
        return parseInt(locationContent.match(/(\d+)個前/)[1]);
      })();

      const delay = (() => {
        const delayContent = bus.querySelector(".delay-minutes-area > .middleText").textContent;

        if (delayContent === "遅れなし") return 0;
        return parseInt(delayContent.match(/(\d+)分/)[1]);
      })();

      const plannedTime = bus.querySelector(".on-time").textContent;

      const arrivalTime = TimeHandler.parseDateToTimeString(
        TimeHandler.addMinutes(
          TimeHandler.parseTimeStringToDate(plannedTime), delay
        )
      );

      services.push({
        companyCode: KokusaiKogyo.COMPANY_CODE,
        
        route,
        destination,
        location,
        plannedTime,
        arrivalTime,
        delay
      });
    }

    console.log(services);

    /*return [
      {
        route: "北浦03",
        destination: "（埼大通り発）北浦和駅西口",
        location: 1,
        plannedTime: "22:19",
        arrivalTime: "22:19",
        delay: 0
      },
    
      {
        route: "北朝02",
        destination: "南与野駅西口",
        location: 3,
        plannedTime: "08:30",
        arrivalTime: "08:58",
        delay: 28
      }
    ];*/

    return services;
  }
}
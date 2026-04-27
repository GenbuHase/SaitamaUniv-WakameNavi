import * as cheerio from "cheerio";
import Time from "@@/shared/utils/Time";

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
    let routes = ROUTES;

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
    const html = await (await fetch(KokusaiKogyo.__getFetchUrl(startId, goalId))).text();
    const $ = cheerio.load(html);
    const buses = $("#resultList > .plotList").toArray();

    const services: Bus.Service[] = [];
    for (const bus of buses) {
      const route = $(bus).find(".courseName").text();
      const destination = $(bus).find(".destination-name").text().replace($(bus).find(".destination-unit").text(), "");

      const location = (() => {
        const locationContent = $(bus).find(".approach-number").text().trim();

        if (locationContent === "始発バス停出発前") return 100;
        if (locationContent === "まもなく到着いたします") return 1;
        return parseInt(locationContent.match(/(\d+)個前/)[1]);
      })();

      const delay = (() => {
        const delayContent = $(bus).find(".delay-minutes-area > .middleText").text();

        if (delayContent === "遅れなし") return 0;
        return parseInt(delayContent.match(/(\d+)分/)[1]);
      })();

      const plannedTime = $(bus).find(".on-time").text();

      const arrivalTime = Time.parseDateToTimeString(
        Time.addMinutes(
          Time.parseTimeStringToDate(plannedTime), delay
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
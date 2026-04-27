import * as cheerio from "cheerio";
import Time from "@@/shared/utils/Time";

import Bus from "..";
import BUS_STOPS from "./BusStops";
import ROUTES from "./Routes";

export default class Seibu {
  public static readonly BASE_URL = "https://transfer.navitime.biz/seibubus-dia/pc/location/BusLocationResult";

  public static readonly COMPANY_CODE = "Seibu";
  public static readonly BUS_STOPS = BUS_STOPS;
  public static readonly ROUTES = ROUTES;



  private static __getFetchUrl = (startId: string, goalId: string) => `${Seibu.BASE_URL}?startId=${startId}&goalId=${goalId}`;



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
    const html = await (await fetch(Seibu.__getFetchUrl(startId, goalId))).text();
    const $ = cheerio.load(html);
    const buses = $("#resultList > .plotList").toArray();

    const services: Bus.Service[] = [];
    for (const bus of buses) {
      const route = $(bus).find(".courseName").text().replace(/[０-９]/g, str => String.fromCharCode(str.charCodeAt(0) - 0xFEE0)).slice(1, -1);
      const destination = $(bus).find(".destination-name").text()?.split("～")[1]?.slice(0, -1) || "";

      const location: number = (() => {
        const className = $(bus).find(".locationClass").attr("class") || "";

        const matcher = className.match(/position-(\d)/);
        return matcher ? parseInt(matcher[1]) : 100;
      })();

      const plannedTime = $(bus).find(".plannedTime").text().match(/\d{1,2}:\d{1,2}/)?.[0] || "";
      const arrivalTime = $(bus).find(".predictionTime").text().match(/\d{1,2}:\d{1,2}/)?.[0] || "";

      const delay = Time.getDifferenceInMinutes(
        Time.parseTimeStringToDate(arrivalTime),
        Time.parseTimeStringToDate(plannedTime)
      );

      services.push({
        companyCode: Seibu.COMPANY_CODE,

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
        route: "＜北浦０３＞",
        destination: "埼玉大学～北浦和駅行",
        location: 10,
        plannedTime: "18:11",
        arrivalTime: "18:11",
        delay: 0
      },

      {
        route: "＜北浦０３＞",
        destination: "埼玉大学～北浦和駅行",
        location: 10,
        plannedTime: "18:27",
        arrivalTime: "18:27",
        delay: 0
      }
    ];*/

    return services;
  }
}
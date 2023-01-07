import { JSDOM } from "jsdom";
import TimeHandler from "~~/utils/TimeHandler";

import Bus from "..";
import SEIBU_BUS_STOPS from "./BusStops";
import SEIBU_ROUTES from "./Routes";

namespace Seibu {
  export const BASE_URL = "https://transfer.navitime.biz/seibubus-dia/pc/location/BusLocationResult";

  export const COMPANY_CODE = "Seibu";
  export const BUS_STOPS = SEIBU_BUS_STOPS
  export const ROUTES = SEIBU_ROUTES;



  const __getFetchUrl = (startId: string, goalId: string) => `${BASE_URL}?startId=${startId}&goalId=${goalId}`;



  export const getRoutes = (startId?: string, goalId?: string) => {
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
  
  export const getServices = async (startId: typeof BUS_STOPS[keyof typeof BUS_STOPS]["id"], goalId: typeof BUS_STOPS[keyof typeof BUS_STOPS]["id"]): Promise<Bus.Service[]> => {
    const dom = await JSDOM.fromURL(__getFetchUrl(startId, goalId));
    const document = dom.window.document;
    const buses = document.querySelectorAll("#resultList > .plotList");

    const services: Bus.Service[] = [];
    for (const bus of buses) {
      const route = bus.querySelector(".courseName").textContent;
      const destination = bus.querySelector(".destination-name").textContent;

      const location: number = (() => {
        const { className } = bus.querySelector(".locationClass");

        const matcher = className.match(/position-(\d)/);
        return matcher ? parseInt(matcher[1]) : 100;
      })();

      const plannedTime = bus.querySelector(".plannedTime").textContent.match(/\d{1,2}:\d{1,2}/)[0];
      const arrivalTime = bus.querySelector(".predictionTime").textContent.match(/\d{1,2}:\d{1,2}/)[0];

      const delay = TimeHandler.getDifferenceInMinutes(
        TimeHandler.parseTimeStringToDate(arrivalTime),
        TimeHandler.parseTimeStringToDate(plannedTime)
      );

      services.push({
        companyCode: COMPANY_CODE,

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

export default Seibu;
import { JSDOM } from "jsdom";

namespace Transportation {
  export const ROUTES = {
    "Kokusai__KitaUrawa-To-SaitamaUniv": "https://transfer.navitime.biz/5931bus/pc/location/BusLocationResult?startId=00021176&goalId=00021229",
    "Kokusai__MinamiYono-To-SaitamaUniv": "https://transfer.navitime.biz/5931bus/pc/location/BusLocationResult?startId=00021362&goalId=00021229",
    "Kokusai__Shiki-To-SaitamaUniv": "https://transfer.navitime.biz/5931bus/pc/location/BusLocationResult?startId=00021278&goalId=00021229",
    "Kokusai__KitaAsaka-To-SaitamaUniv": "https://transfer.navitime.biz/5931bus/pc/location/BusLocationResult?startId=00021352&goalId=00021229",
    "Kokusai__Urawa-To-SaitamaUnivUra": "https://transfer.navitime.biz/5931bus/pc/location/BusLocationResult?startId=00021083&goalId=00021185"
  }

  export type Service = {
    route: string;
    destination: string;
    location: string;
    onTime: string;
    arrivalTime: string;
    delay: string;
  }

  export const getServices = async (route: string): Promise<Service[]> => {
    const dom = await JSDOM.fromURL(route);
    const document = dom.window.document;
    const buses = document.querySelectorAll("#resultList > .plotList");

    const services: Service[] = [];
    for (const bus of buses) {
      const route = bus.querySelector(".courseName").textContent;
      const destination = bus.querySelector(".destination-name").textContent;
      const location = bus.querySelector(".approach-number").textContent;
      const onTime = bus.querySelector(".on-time").textContent;
      const arrivalTime = bus.querySelector(".minutes-to-arrival > strong").textContent;
      const delay = bus.querySelector(".delay-minutes-area > .middleText").textContent;

      services.push({
        route,
        destination,
        location,
        onTime,
        arrivalTime,
        delay
      });
    }

    return services;
  }
}

export default Transportation;
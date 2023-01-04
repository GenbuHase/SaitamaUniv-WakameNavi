import { JSDOM } from "jsdom";

namespace Transportation {
  export namespace Bus {
    export type Service = {
      route: string;
      destination: string;
      location: string;
      onTime: string;
      arrivalTime: string;
      delay: string;
    }



    export namespace KokusaiKogyo {
      export const TYPE = "KokusaiKogyo";
      export const BASE_URL = "https://transfer.navitime.biz/5931bus/pc/location/BusLocationResult";

      export const BUS_STOP_IDS = {
        SaitamaUniv: "00021229",
        KitaUrawa: "00021176",
        MinamiYono: "00021362",
        Shiki: "00021278",
        KitaAsaka: "00021352",

        SaitamaUnivUra: "00021185",
        Urawa: "00021083"
      }

      export const getServices = async (startId: typeof BUS_STOP_IDS[keyof typeof BUS_STOP_IDS], goalId: typeof BUS_STOP_IDS[keyof typeof BUS_STOP_IDS]): Promise<Service[]> => {
        const dom = await JSDOM.fromURL(__getFetchUrl(startId, goalId));
        const document = dom.window.document;
        const buses = document.querySelectorAll("#resultList > .plotList");
  
        const services: Service[] = [];
        for (const bus of buses) {
          const route = bus.querySelector(".courseName").textContent;
          const destination = bus.querySelector(".destination-name").textContent;
          const location = bus.querySelector(".approach-number").textContent.trim();
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

        console.log(services);
        return services;
      }

      const __getFetchUrl = (startId: string, goalId: string) => `${BASE_URL}?startId=${startId}&goalId=${goalId}`;
    }

    export namespace Seibu {
      export const BASE_URL = "https://transfer.navitime.biz/seibubus-dia/pc/location/BusLocationResult";
      
      export const BUS_STOP_IDS = {
        SaitamaUniv: "00111643",
        KitaUrawa: "00111628",
        MinamiYono: "00111644"
      }

      const __getFetchUrl = (startId: string, goalId: string) => `${BASE_URL}?startId=${startId}&goalId=${goalId}`;
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
}

export default Transportation;
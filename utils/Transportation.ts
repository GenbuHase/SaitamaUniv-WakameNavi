import { JSDOM } from "jsdom";
import TimeHandler from "./TimeHandler";

namespace Transportation {
  export namespace Bus {
    export type Service = {
      route: string;
      destination: string;
      location: number;
      plannedTime: string;
      arrivalTime: string;
      delay: number;
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
            route,
            destination,
            location,
            plannedTime,
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
      export const TYPE = "Seibu";
      export const BASE_URL = "https://transfer.navitime.biz/seibubus-dia/pc/location/BusLocationResult";
      
      export const BUS_STOP_IDS = {
        SaitamaUniv: "00111643",
        KitaUrawa: "00111628",
        MinamiYono: "00111644"
      }

      export const getServices = async (startId: typeof BUS_STOP_IDS[keyof typeof BUS_STOP_IDS], goalId: typeof BUS_STOP_IDS[keyof typeof BUS_STOP_IDS]): Promise<Service[]> => {
        const dom = await JSDOM.fromURL(__getFetchUrl(startId, goalId));
        const document = dom.window.document;
        const buses = document.querySelectorAll("#resultList > .plotList");
  
        const services: Service[] = [];
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

      const __getFetchUrl = (startId: string, goalId: string) => `${BASE_URL}?startId=${startId}&goalId=${goalId}`;
    }
  }
}

export default Transportation;
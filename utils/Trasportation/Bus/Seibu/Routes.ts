import Bus from "../";
import BUS_STOPS from "./BusStops";

export const ROUTES: Bus.Route[] = [
  { companyCode: "Seibu", name: "北浦03", start: BUS_STOPS.KitaUrawa, goal: BUS_STOPS.SaitamaUniv, via: [] },
  { companyCode: "Seibu", name: "北浦03", start: BUS_STOPS.SaitamaUniv, goal: BUS_STOPS.KitaUrawa, via: [] },

  { companyCode: "Seibu", name: "南与01", start: BUS_STOPS.MinamiYono, goal: BUS_STOPS.SaitamaUniv, via: [] },
  { companyCode: "Seibu", name: "南与01", start: BUS_STOPS.SaitamaUniv, goal: BUS_STOPS.MinamiYono, via: [] }
]

export default ROUTES;
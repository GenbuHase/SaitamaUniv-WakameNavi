import Bus from "../";
import BUS_STOPS from "./BusStops";

export const ROUTES: Bus.Route[] = [
  { companyCode: "KokusaiKogyo", name: "北浦03", start: BUS_STOPS.KitaUrawa, goal: BUS_STOPS.SaitamaUniv, via: [] },
  { companyCode: "KokusaiKogyo", name: "北浦03", start: BUS_STOPS.SaitamaUniv, goal: BUS_STOPS.KitaUrawa, via: [] },

  { companyCode: "KokusaiKogyo", name: "南与01", start: BUS_STOPS.MinamiYono, goal: BUS_STOPS.SaitamaUniv, via: [] },
  { companyCode: "KokusaiKogyo", name: "南与01", start: BUS_STOPS.SaitamaUniv, goal: BUS_STOPS.MinamiYono, via: [] },

  { companyCode: "KokusaiKogyo", name: "南与02", start: BUS_STOPS.MinamiYono, goal: BUS_STOPS.ShimoOkubo, via: [ BUS_STOPS.SaitamaUniv ] },
  { companyCode: "KokusaiKogyo", name: "南与02", start: BUS_STOPS.ShimoOkubo, goal: BUS_STOPS.MinamiYono, via: [ BUS_STOPS.SaitamaUniv ] },

  { companyCode: "KokusaiKogyo", name: "志03-3", start: BUS_STOPS.Shiki, goal: BUS_STOPS.MinamiYono, via: [ BUS_STOPS.ShimoOkubo, BUS_STOPS.SaitamaUniv ] },
  { companyCode: "KokusaiKogyo", name: "志03-3", start: BUS_STOPS.MinamiYono, goal: BUS_STOPS.Shiki, via: [ BUS_STOPS.SaitamaUniv, BUS_STOPS.ShimoOkubo ] },

  { companyCode: "KokusaiKogyo", name: "北朝02", start: BUS_STOPS.KitaAsaka, goal: BUS_STOPS.MinamiYono, via: [ BUS_STOPS.ShimoOkubo, BUS_STOPS.SaitamaUniv ] },
  { companyCode: "KokusaiKogyo", name: "北朝02", start: BUS_STOPS.MinamiYono, goal: BUS_STOPS.KitaAsaka, via: [ BUS_STOPS.SaitamaUniv, BUS_STOPS.ShimoOkubo ] },

  { companyCode: "KokusaiKogyo", name: "浦13", start: BUS_STOPS.Urawa, goal: BUS_STOPS.OkuboPurificationPlant, via: [ BUS_STOPS.SaitamaUnivUra ] },
  { companyCode: "KokusaiKogyo", name: "浦13", start: BUS_STOPS.OkuboPurificationPlant, goal: BUS_STOPS.Urawa, via: [ BUS_STOPS.SaitamaUnivUra ] },

  { companyCode: "KokusaiKogyo", name: "浦桜13-3", start: BUS_STOPS.Urawa, goal: BUS_STOPS.OkuboPurificationPlant, via: [ BUS_STOPS.SaitamaUnivUra ] },
  { companyCode: "KokusaiKogyo", name: "浦桜13-3", start: BUS_STOPS.OkuboPurificationPlant, goal: BUS_STOPS.Urawa, via: [ BUS_STOPS.SaitamaUnivUra ] }
]

export default ROUTES;
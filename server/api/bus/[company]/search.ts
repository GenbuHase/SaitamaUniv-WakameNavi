import Transportation from "@/utils/Transportation";

const { KokusaiKogyo, Seibu } = Transportation.Bus;

export default defineEventHandler(async event => {
  const ctx = event.context;
  const KokusaiKogyo_BusStopIds = KokusaiKogyo.BUS_STOP_IDS;
  const Seibu_BusStopIds = Seibu.BUS_STOP_IDS;

  const { company } = ctx.params;
  const { startPos, goalPos } = getQuery(event);

  console.log(ctx.params, getQuery(event));

  switch (company) {
    case KokusaiKogyo.TYPE:
      return await KokusaiKogyo.getServices(KokusaiKogyo_BusStopIds[startPos as keyof typeof KokusaiKogyo_BusStopIds], KokusaiKogyo_BusStopIds[goalPos as keyof typeof KokusaiKogyo_BusStopIds]);

    case Seibu.TYPE:
      // return await Seibu.getServices("00110252", "00110264");
      return await Seibu.getServices(Seibu_BusStopIds[startPos as keyof typeof Seibu_BusStopIds], Seibu_BusStopIds[goalPos as keyof typeof Seibu_BusStopIds]);
  }
});
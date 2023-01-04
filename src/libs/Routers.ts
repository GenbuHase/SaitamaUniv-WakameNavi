import fs from "fs";
import Router from "@koa/router";
import Transportation from "./Transportation";

const { KokusaiKogyo, Seibu } = Transportation.Bus;

const router = new Router();
const busRouter = new Router({ prefix: "/bus" });

router
  .get(/.*/, async (ctx, next) => {
    await next();

    console.log(ctx.request.url, ctx);
  })
  .get("/", async (ctx, next) => {
    await next();

    ctx.response.type = "html";
    ctx.response.body = fs.readFileSync("./src/index.html", "utf-8");
  });

busRouter
  .get("/:busCompany(Seibu|KokusaiKogyo)/search", async (ctx, next) => {
    await next();
    console.log("Now searching services...");

    const KokusaiKogyo_BusStopIds = KokusaiKogyo.BUS_STOP_IDS;
    const Seibu_BusStopIds = Seibu.BUS_STOP_IDS;

    const { busCompany } = ctx.params;
    const { startPos, goalPos } = ctx.request.query;

    console.log(ctx.params, ctx.request.query);

    switch (busCompany) {
      case KokusaiKogyo.TYPE:
        ctx.body = await KokusaiKogyo.getServices(KokusaiKogyo_BusStopIds[startPos as keyof typeof KokusaiKogyo_BusStopIds], KokusaiKogyo_BusStopIds[goalPos as keyof typeof KokusaiKogyo_BusStopIds]);
        break;

      case Seibu.TYPE:
        // ctx.body = await Seibu.getServices("00110252", "00110264");
        ctx.body = await Seibu.getServices(Seibu_BusStopIds[startPos as keyof typeof Seibu_BusStopIds], Seibu_BusStopIds[goalPos as keyof typeof Seibu_BusStopIds]);
        break;
    }

    ctx.res.writeHead(200);
  });

router
  .use("", busRouter.routes(), busRouter.allowedMethods());



export default { router, busRouter };
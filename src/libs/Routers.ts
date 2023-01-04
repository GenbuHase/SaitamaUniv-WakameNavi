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

    const { BUS_STOP_IDS } = KokusaiKogyo;
    const { busCompany } = ctx.params;
    const { startPos, goalPos } = ctx.request.query;

    console.log(ctx.params, ctx.request.query);

    switch (busCompany) {
      case KokusaiKogyo.TYPE:
        ctx.body = await KokusaiKogyo.getServices(BUS_STOP_IDS[startPos as keyof typeof BUS_STOP_IDS], BUS_STOP_IDS[goalPos as keyof typeof BUS_STOP_IDS]);
        break;
    }

    ctx.res.writeHead(200);
  });

router
  .use("", busRouter.routes(), busRouter.allowedMethods());



export default { router, busRouter };
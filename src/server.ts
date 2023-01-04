import Koa from "koa";
import Routers from "./libs/Routers";
import Transportation from "./libs/Transportation";

const { router, busRouter } = Routers;
const { KokusaiKogyo, Seibu } = Transportation.Bus;

const app = new Koa();

app
  .use(router.routes())
  .use(router.allowedMethods())

  .listen(3000, () => {
    console.log("Server is running on port 3000");
  });
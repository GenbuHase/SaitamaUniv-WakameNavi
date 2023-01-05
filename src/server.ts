import Koa from "koa";
import serve from "koa-static";
import router from "./router";

const app = new Koa();

app
  .use(serve("./src/public"))
  .use(router.routes())
  .use(router.allowedMethods())

  .listen(3000, () => {
    console.log("Server is running on port 3000");
  });
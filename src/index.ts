import fs from "fs";

import Koa from "koa";

import Transportation from "./libs/Transportation";

const app = new Koa();

app.use(async ctx => {
  ctx.response.type = "html";
  ctx.response.body = "";

  const route = ctx.request.query.route as "Kokusai__KitaUrawa-To-SaitamaUniv" | "Kokusai__MinamiYono-To-SaitamaUniv" | "Kokusai__Shiki-To-SaitamaUniv" | "Kokusai__KitaAsaka-To-SaitamaUniv" | "Kokusai__Urawa-To-SaitamaUnivUra";
  const services = await Transportation.getServices(Transportation.ROUTES[route]);

  for (const service of services) {
    ctx.response.body += `
      <div>
        <div>${service.route}</div>
        <div>${service.destination}</div>
        <div>${service.location}</div>
        <div>${service.onTime}</div>
        <div>${service.arrivalTime}</div>
        <div>${service.delay}</div>
      </div>
    `;
  }
});

app.listen(3000, () => {
	console.log("Server is running on port 3000");
});
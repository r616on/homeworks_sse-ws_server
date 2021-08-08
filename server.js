const http = require("http");
const Koa = require("koa");
const app = new Koa();
const koaBody = require("koa-body");
const port = process.env.PORT || 7070; // слушаем определённый порт
const cors = require("@koa/cors");
let moment = require("moment");

const Router = require("koa-router");
const router = new Router();
const uuid = require("uuid");

app.use(
  koaBody({
    urlencoded: true,
    multipart: true,
    json: true,
  })
);
app.use(cors());

router.get("/contacts", async (ctx, next) => {
  // return list of contacts
  ctx.response.body = contacts;
});

router.post("/cont", async (ctx, next) => {
  // create new contact
  console.log("post");
  console.log(ctx.request.body);
  ctx.response.body = JSON.stringify({ ok: true });
  // contacts.push({ ...ctx.request.body, id: uuid.v4() });
  ctx.response.status = 204;
});

router.delete("/contacts/:id", async (ctx, next) => {
  // remove contact by id (ctx.params.id)
  const index = contacts.findIndex(({ id }) => id === ctx.params.id);
  if (index !== -1) {
    contacts.splice(index, 1);
  }
  ctx.response.status = 204;
});

app.use(router.routes());
app.use(router.allowedMethods());

const server = http.createServer(app.callback()).listen(port);

// app.use(async (ctx) => {
//   console.log("Serv RUN");

//   if (ctx.request.method === "POST") {
//     const data = JSON.parse(ctx.request.body);
//     switch (data.method) {
//       case "ok":
//         ctx.response.body = { ok: true };
//         break;
//       default:
//         ctx.response.status = 404;
//         break;
//     }
//   } else {
//     ctx.response.status = 404;
//     return;
//   }
// });

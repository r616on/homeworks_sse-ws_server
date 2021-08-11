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

const WS = require("ws");

app.use(
  koaBody({
    urlencoded: true,
    multipart: true,
    json: true,
  })
);
app.use(cors());

// router.get("/contacts", async (ctx, next) => {
//   // return list of contacts
//   ctx.response.body = contacts;
// });
// router.post("/login", async (ctx, next) => {
//   // create new contact
//   const data = JSON.parse(ctx.request.body);
//   const index = clients.findIndex((item) => {
//     if (item.login === data.login) {
//       return true;
//     }
//   });
//   if (index > -1) {
//     ctx.response.status = 205;
//   } else {
//     ctx.response.status = 204;
//     clients.push({ login: data.login });
//   }

// });

app.use(router.routes());
app.use(router.allowedMethods());

const server = http.createServer(app.callback());

const wsServer = new WS.Server({ server });
const clients = [];
const messageDb = [];
//{ id: 123235, login: "ivan", ws: "" }

wsServer.on("connection", (ws, req) => {
  const id = uuid.v4();
  clients.push({ id: id, login: "", ws: ws });
  let name = "";

  ws.on("message", (msg) => {
    const message = JSON.parse(msg);
    //Registr chat
    if (message.method === "register") {
      name = message.login;
      const index = clients.findIndex((item) => {
        if (item.login === message.login) {
          return true;
        }
      });
      if (index > -1) {
        ws.send(JSON.stringify({ method: "register", status: "no" }));
      } else {
        clients.forEach((item) => {
          if (item.id === id) {
            item.login = name;
          }
        });
        ws.send(
          JSON.stringify({ method: "register", status: "ok", name: name })
        );
        //update User
        clients.forEach((user) => {
          if (user.login === "") {
          } else {
            const arr = clients.map((el) => el.login);
            const messSend = {
              method: "update",
              arrUser: arr,
            };

            user.ws.send(JSON.stringify(messSend));
          }
        });
      }
    }
    //end update

    // end registr chat

    if (message.method === "message") {
      let moment = require("moment");
      const date = moment().format("lll");
      messageDb.push({
        author: name,
        textMassage: message.textMassage,
        date: date,
      });
      //Newsletter to users
      clients.forEach((user) => {
        if (user.login === "") {
        } else {
          const messSend = {
            author: name,
            textMassage: message.textMassage,
            method: "message",
            date: date,
          };

          user.ws.send(JSON.stringify(messSend));
        }
      });
      //end newsletter
    }
  });

  ws.on("close", () => {
    const index = clients.findIndex((item) => {
      if (item.login === name) {
        return true;
      }
    });
    clients.splice(index, 1);
    const arrName = clients.map((item) => item.login);
    clients.forEach((user) => {
      if (user.login === "") {
      } else {
        const messSend = {
          method: "update",
          arrUser: arrName,
        };
        user.ws.send(JSON.stringify(messSend));
      }
    });
  });
});
server.listen(port);

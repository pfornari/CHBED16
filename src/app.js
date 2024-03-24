import express from "express";
import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import realTimeProductsRouter from "./routes/realTimeProducts.router.js";
import realTimeProductsSocket from "./sockets/realTimeProducts.socket.js";
import chatRouter from "./routes/chat.router.js";
import chatSocket from "./sockets/chat.socket.js";
import profileRouter from "./routes/profile.router.js";
import mockingProductsRouter from "./routes/mockingProducts.router.js";
import loggerTestRouter from "./routes/logger.test.route.js";
import handlebars from "express-handlebars";
import sessionsRouter from "./routes/sessions.router.js";
import usersViewRouter from "./routes/users.views.router.js";
import __dirname from "./utils.js";
import { Server } from "socket.io";
import { allowInsecurePrototypeAccess } from "@handlebars/allow-prototype-access";
import mongoose from "mongoose";
import Handlebars from "handlebars";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import initializePassport from "./config/passport.config.js";
import githubLoginViewRouter from "./routes/githubLogin.router.js";
import cookieParser from "cookie-parser";
import config from "./config/config.js";
import { addLogger } from "./config/loggerCustom.js";

const app = express();

app.use(
  session({
    store: MongoStore.create({
      mongoUrl: config.mongoUrl,
      mongoOptions: { useNewUrlParser: true, useUnifiedTopology: true },
      ttl: 60,
    }),

    secret: config.privateKey,
    resave: false,
    saveUninitialized: false,
  })
);

mongoose
  .connect(config.mongoUrl)
  .then(() => console.log("DB connected"))
  .catch((err) => console.error("Error connecting to the database:", err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (request, response) => {
  response.send("<h1> Bienvenidos al servidor.</h1>");
});

app.use(cookieParser(config.privateKey));

initializePassport();
app.use(passport.initialize());
//app.use(passport.session());

app.use(addLogger);

app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/api/users", usersViewRouter);
app.use("/github", githubLoginViewRouter);
app.use("/api/profile", profileRouter);
app.use("/api/mockingproducts", mockingProductsRouter);
app.use("api/loggertest", loggerTestRouter);

app.get("/api/logger", (req, res) => {
  req.logger.warning("Prueba de log level warning --> en Endpoint");
  res.send("prueba de logger");
});

app.engine(
  "hbs",
  handlebars.engine({
    extname: "hbs",
    defaultLayout: "main",
    handlebars: allowInsecurePrototypeAccess(Handlebars),
  })
);
app.set("views", `${__dirname}/views`);
app.set("view engine", "hbs");

app.use(express.static(__dirname + "/public"));

const httpServer = app.listen(config.port, () =>
  console.log("Servidor en el puerto 8080 esta activo.")
);

const io = new Server(httpServer);
realTimeProductsSocket(io);
chatSocket(io);
app.use("/api/realtimeproducts", realTimeProductsRouter);
app.use("/api/chat", chatRouter);

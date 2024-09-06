import express from "express";
import morgan from "morgan";
import path from "path";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { createServer } from "node:http";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import { setupSocket } from "./socket/socket.js";
import authRouter from "./routes/authRouter.js";
import articleRouter from "./routes/articleRouter.js";
import chatRouter from "./routes/chatRouter.js";
import memberRouter from "./routes/memberRouter.js";

dotenv.config();
const port = process.env.port;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  path: "/chat/socket.io/",
  cors: {
    origin: "*",
  },
});

app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));
app.use(bodyParser.json({ limit: "100mb" }));
app.use(morgan("combined"));

//Routers
app.use("/api/auth", authRouter);
app.use("/api/article", articleRouter);
app.use("/api/chat", chatRouter);
app.use("/api/member", memberRouter);
setupSocket(io);

//static
app.use(express.static(path.join(__dirname, "public")));
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.get("/articleWrite", function (req, res) {
  res.sendFile(path.join(__dirname, "public", "articleWrite.html"));
});
app.get("/articleView", function (req, res) {
  res.sendFile(path.join(__dirname, "public", "articleView.html"));
});
app.get("/articleList", function (req, res) {
  res.sendFile(path.join(__dirname, "public", "articleList.html"));
});
app.get("/sign", function (req, res) {
  res.sendFile(path.join(__dirname, "public", "sign.html"));
});
app.get("/chat", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "chat.html"));
});
app.get("/member", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "member.html"));
});

//loader.io
app.get("/loaderio-3d25eebd5ba80d681bf17e6486b56acb", function (req, res) {
  res.sendFile(path.join(__dirname, "public", "loaderio.txt"));
});

server.listen(port, function () {
  console.log("--------啟動測試-----------");
  console.log("Server is running at https://www.trippals.site");
  console.log(`Server is running at port: ${port}`);
});
server.setTimeout(1 * 60 * 1000); //1分鐘限制

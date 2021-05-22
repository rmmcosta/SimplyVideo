const express = require("express");
const app = express();
const http = require("http");
const httpServer = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(httpServer);
const { v4: uuidv4 } = require("uuid");
const config = require("./config");

app.set("view engine", "ejs");

app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  console.log("main route");
  res.redirect(`/room/${uuidv4()}`);
});

app.get("/room/:room", (req, res) => {
  console.log("room route ", req.params.room);
  res.render("index", { roomId: req.params.room });
});

io.on("connection", (socket) => {});

httpServer.listen(config.API_PORT, () => {
  const appid = process.env.CODESPHERE_APP_ID;
  let appurl;
  if (appid) appurl = `https://${appid}-${config.API_PORT}.codesphere.com`;
  else appurl = `http://localhost:${config.API_PORT}`;
  console.info(`You can access the Simply Video on ${appurl}`);
});

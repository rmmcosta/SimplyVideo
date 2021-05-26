const express = require("express");
const app = express();
const https = require("https");
const fs = require('fs');
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");
const config = require("./config");

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

const httpsServer = https.createServer(options, app);
const io = new Server(httpsServer);

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

io.on("connection", socket => {
  console.log("a user connected");

  socket.on('joined-room', (roomId, userId) => {
    console.log('joined-room', 'userid: ', userId, 'roomId ', roomId);
    socket.join(roomId);
    socket.broadcast.emit('user-connected', userId);
    socket.on('disconnect', () => {
      console.log("user disconnected with user id ", userId);
      socket.broadcast.emit('user disconnected', userId);
    });
  });

  socket.on('disconnect', () => {
    console.log("user disconnected");
  });
});

const listenHandler = (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`Simply Video up and running on https://${config.host}:${config.port}`);
  }
}

httpsServer.listen(config.port, listenHandler);

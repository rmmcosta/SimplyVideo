const express = require("express");
const app = express();
const https = require('https');
const fs = require('fs');
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");
const config = require("./config");
const cors = require('cors');

const whitelist = ['http://127.0.0.1:8081', process.env.IP, 'http://localhost:3000', 'https://109.49.167.65:3000'];
const corsOptions = {
  origin: function (origin, callback) {
    console.log('cors origin:', origin);
    // allow requests with no origin 
    // (like mobile apps or curl requests)
    if (!origin)
      return callback(null, true);

    if (whitelist.indexOf(origin) === -1) {
      var msg = 'The CORS policy for this site does not ' +
        'allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }

    return callback(null, true);
  }
}

//use cors
app.use(cors(corsOptions));

app.set("view engine", "ejs");

app.use(express.static(__dirname + "/public"));

app.get("/", cors(corsOptions), (req, res) => {
  console.log("main route");
  res.redirect(`/room/${uuidv4()}`);
});

app.get("/room/:room", cors(corsOptions), (req, res) => {
  console.log("room route", req.params.room);
  res.render("index", { roomId: req.params.room });
});

io.on('connection', socket => {
  console.log('on io connection');
  // When someone attempts to join the room
  console.log('on socket connection');

  socket.on('join-room', (roomId, userId) => {
    console.log(`user with id ${userId} joined the room ${roomId}`);
    socket.join(roomId);  // Join the room
    socket.broadcast.emit('user-connected', userId); // Tell everyone else in the room that we joined

    socket.on('disconnect', () => {
      console.log(`user with id ${userId} has disconneted from room ${roomId}`);
      socket.broadcast.emit('user-disconnected', userId);
    });
  });

  socket.on('disconnect', () => {
    console.log(`user has disconneted`);
    socket.broadcast.emit('user-disconnected');
  });
});

httpsServer.listen(config.API_PORT, () => {
  const appid = process.env.CODESPHERE_APP_ID;
  let appurl;
  if (appid) appurl = `https://${appid}-${config.API_PORT}.codesphere.com`;
  else appurl = `https://localhost:${config.API_PORT}`;
  console.info(`You can access the Simply Video on ${appurl}`);
});

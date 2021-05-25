const express = require("express");
const app = express();
const https = require('https');
const fs = require('fs');
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");
const config = require("./config");
const cors = require("cors");

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};
const httpsServer = https.createServer(options, app);
const io = new Server(httpsServer);

app.set("view engine", "ejs");

app.use(express.static(__dirname + "/public"));

const whitelist = ['http://127.0.0.1:8081', process.env.IP, 'http://109.49.167.65:3000', 'http://109.49.167.65:8080'];
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

app.get("/", cors(corsOptions), (req, res) => {
  console.log("main route");
  res.redirect(`/room/${uuidv4()}`);
});

app.get("/room/:room", cors(corsOptions), (req, res) => {
  console.log("room route ", req.params.room);
  res.render("index", { roomId: req.params.room });
});

io.on('connection', socket => {
  console.log('on io connection');
  // When someone attempts to join the room
  socket.on('join-room', (roomId, userId) => {
    console.log('join-room', roomId, userId);
    socket.join(roomId);  // Join the room
    socket.broadcast.emit('user-connected', userId); // Tell everyone else in the room that we joined

    // Communicate the disconnection
    socket.on('disconnect', () => {
      console.log('on disconnect', roomId, userId);
      socket.broadcast.emit('user-disconnected', userId);
    });
  });
});

httpsServer.listen(config.API_PORT, () => {
  const appid = process.env.CODESPHERE_APP_ID;
  let appurl;
  if (appid) appurl = `https://${appid}-${config.API_PORT}.codesphere.com`;
  else appurl = `https://localhost:${config.API_PORT}`;
  console.info(`You can access the Simply Video on ${appurl}`);
});

const express = require("express");
const app = express();
const https = require("https");
const fs = require('fs');
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");
const config = require("./config");
const path = require("path");

const options = {
  key: fs.readFileSync('/etc/ssl/rmmcosta.hopto.org.key'),
  cert: fs.readFileSync('/etc/ssl/rmmcosta.hopto.org.crt')
};

const httpsServer = https.createServer(options, app);
const io = new Server(httpsServer);

app.set("view engine", "ejs");

app.use(express.static(__dirname + "/../public/SimplyVideo"));

app.get("/SimplyVideo", (req, res) => {
  res.render("index");
});

app.get("/SimplyVideo/:resource", (req, res) => {
  if (req.params.resource === 'service-worker.js') {
    const options = {
      root: path.join(__dirname, '/../public/SimplyVideo'),
      headers: {
        'Content-Type': 'application/javascript'
      }
    };
    const fileName = req.params.resource;
    res.sendFile(fileName, options, err => {
      if (err) {
        console.log('Error:', err);
      } else {
        console.log('Sent:', fileName);
      }
    });
  }
});

app.get("/SimplyVideo/room", (req, res) => {
  console.log("room route " + req.secure ? 'secure' : 'insecure');
  res.redirect(`/room/${uuidv4()}`);
});

app.get("/SimplyVideo/room/:room", (req, res) => {
  if (req.params.room === 'service-worker.js') {
    const options = {
      root: path.join(__dirname, '/../public/SimplyVideo'),
      headers: {
        'Content-Type': 'application/javascript'
      }
    };
    const fileName = req.params.room;
    res.sendFile(fileName, options, err => {
      if (err) {
        console.log('Error:', err);
      } else {
        console.log('Sent:', fileName);
      }
    });
  }
  else {
    console.log("room route ", req.params.room);
    res.render("room", { roomId: req.params.room });
  }
});

io.on("connection", socket => {
  console.log("a user connected");

  socket.on('joined-room', (roomId, userId, usersName) => {
    console.log('joined-room', 'userid: ', userId, 'roomId: ', roomId, 'usersName: ', usersName);
    socket.join(roomId);
    socket.broadcast.emit('user-connected', roomId, userId, usersName);
    socket.on('disconnect', () => {
      console.log("user disconnected with user id ", userId);
      socket.broadcast.emit('user disconnected', userId);
    });
  });

  //on users changed Name
  socket.on('changed-name', (roomId, userId, usersName) => {
    console.log('changed-name', roomId, userId, usersName);
    socket.broadcast.emit('changed-name', roomId, userId, usersName);
  });

  //muteUser, unmuteUser, turnUserCameraOff, turnUserCameraOn
  socket.on('muteUser', (roomId, userId) => {
    console.log('muteUser', roomId, userId);
    socket.broadcast.emit('muteUser', roomId, userId);
  });

  socket.on('unmuteUser', (roomId, userId) => {
    console.log('unmuteUser', roomId, userId);
    socket.broadcast.emit('unmuteUser', roomId, userId);
  });

  socket.on('turnUserCameraOff', (roomId, userId) => {
    console.log('turnUserCameraOff', roomId, userId);
    socket.broadcast.emit('turnUserCameraOff', roomId, userId);
  });

  socket.on('turnUserCameraOn', (roomId, userId) => {
    console.log('turnUserCameraOn', roomId, userId);
    socket.broadcast.emit('turnUserCameraOn', roomId, userId);
  });

  socket.on('disconnect', (roomId, userId) => {
    console.log("user disconnected");
    socket.broadcast.emit('user-ended-call', roomId, userId);
  });

  socket.on('ended-call', (roomId, userId, userName) => {
    console.log('ended-call', roomId, userId, userName);
    socket.broadcast.emit('user-ended-call', roomId, userId, userName);
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

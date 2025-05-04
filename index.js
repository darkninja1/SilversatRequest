const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');
const xss = require('xss');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static("client"));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/pages/home.html'));
});

// app.get('/login', (req, res) => {
//     res.render('login');
// });


// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

//reorder schedule when writing the database
const reorderSchedule = (schedule) => {
  let reorderedSchedule = schedule.sort((a, b) => a.Time - b.Time);
  return reorderedSchedule;
};
const log = (log) => {
  try {
    let logs = JSON.parse(fs.readFileSync(__dirname + '/server/json/logs.json', 'utf8'));
    logs.logs.push({ "ip":"replace with ip", "log":xss(log) });
    fs.writeFileSync(__dirname + '/server/json/logs.json', JSON.stringify(logs), (err) => {
      if (err) throw err;
    });
  } catch (err) {
    console.log("logging error");
  }
};

// Handle socket.io connections
io.on('connection', (socket) => {
  console.log('A user connected');
  // Event: User login
  socket.on('request', ({ uid, lat, lon }) => {
    try {
      let requests = JSON.parse(fs.readFileSync(__dirname + '/server/json/requests.json', 'utf8'));
      requests.requests.push({ "Name": xss(uid), "IP": "test", "Lat": xss(lat), "Lon": xss(lon), "Time": new Date().getTime() });
      fs.writeFileSync(__dirname + '/server/json/requests.json', JSON.stringify(requests), (err) => {
        if (err) throw err;
      });
      log("UID: "+uid+", Requested: "+lat+","+lon);
      socket.emit("success", { message: 'Request Submitted' });
    } catch (err) {
      socket.emit('error', { message: 'Error during request', error: err });
    }
  });
  socket.on('scheduleUpdate', ({ updatedSchedule }) => {
    try {
      let schedule = JSON.parse(fs.readFileSync(__dirname + '/server/json/schedule.json', 'utf8'));
      schedule.schedule = reorderSchedule(xss(updatedSchedule.schedule));
      fs.writeFileSync(__dirname + '/server/json/requests.json', JSON.stringify(requests), (err) => {
        if (err) throw err;
      });
      log("UID: "+uid+", Updated Schdule");
      socket.emit("success", { message: 'Schedule Updated' });
    } catch (err) {
      socket.emit('error', { message: 'Error during schdule change', error: err });
    }
  });
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});
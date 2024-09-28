const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');
// const { MongoClient } = require('mongodb');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files and set view engine (similar to your previous setup)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'client/pages'));
app.use('/js', express.static(path.join(__dirname, 'client/js')));
app.use('/css', express.static(path.join(__dirname, 'client/css')));
app.use('/pics', express.static(path.join(__dirname, 'client/pics')));
app.use('/music', express.static(path.join(__dirname, 'client/music')));

app.get('/', (req, res) => {
  res.render('main');
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
    let logs = JSON.parse(fs.readFileSync(__dirname + '/client/json/logs.json', 'utf8'));
    logs.logs.push({ "ip":"replace with ip", "log":log });
    fs.writeFileSync(__dirname + '/client/json/logs.json', JSON.stringify(logs), (err) => {
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
  socket.on('request', async () => {
    try {
      let requests = JSON.parse(fs.readFileSync(__dirname + '/client/json/requests.json', 'utf8'));
      // requests.requests.push({});
      fs.writeFileSync(__dirname + '/client/json/requests.json', JSON.stringify(requests), (err) => {
        if (err) throw err;
      });
      // log("UID: "+uid+", Requested: "+lat+","+lon);
    } catch (err) {
      socket.emit('error', { message: 'Error during request', error: err });
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});
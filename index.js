const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');
const xss = require('xss');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const nodemailer = require('nodemailer');

//add nodemailer to send list of most popular requests each week then archive requests and reset

app.use(express.static("client"));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/pages/home.html'));
});

const SENDER = 'no-reply@silversat.org';
const APPPASS = 'your-app-password'; // Gmail App Password (this has to be created)

const RECIPIENTS = ['dominik@silversat.org'];

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: SENDER,
    pass: APPPASS
  }
});

// Main function with parameters
const sendEmail = (recipientsArray, subjectLine, contentHTML) => {
  const mailOptions = {
    from: SENDER,
    to: recipientsArray.join(','),
    subject: subjectLine,
    html: contentHTML
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error('❌ Failed to send email:', err);
    } else {
      console.log('✅ Email sent:', info.response);
    }
  });
};

const sendSummary = () => {
  try {
    const requestsPath = path.join(__dirname, 'requests.json');
    const requests = JSON.parse(fs.readFileSync(requestsPath, 'utf8')).requests || [];

    const htmlTable = `
      <h2>📍 Location Request Report</h2>
      <table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse;">
        <thead style="background:#f0f0f0;">
          <tr>
            <th>#</th><th>Name</th><th>Lat</th><th>Lon</th><th>Time</th>
          </tr>
        </thead>
        <tbody>
          ${requests.map((r, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${r.Name}</td>
              <td>${r.Lat}</td>
              <td>${r.Lon}</td>
              <td>${new Date(r.Time).toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    sendEmail(RECIPIENTS, '📬 Location Request Report', htmlTable);
  }
  catch (err) {
    console.log(err);
  }
};

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
  socket.on('render', () => {
    try {
      let requestsJSON = JSON.parse(fs.readFileSync(__dirname + '/server/json/requests.json', 'utf8'));
      let newRequests = [];
      for (let i = 0;i < Object.keys(requestsJSON.requests).length;i++) {
        newRequests.push({lat:requestsJSON.requests[i].Lat,lon:requestsJSON.requests[i].Lon});
      }
      socket.emit("render", { requests: newRequests });
    } catch (err) {
      socket.emit('error', { message: 'Error during request', error: err });
    }
  });
  socket.on('request', ({ uid, lat, lon }) => {
    try {
      let requests = JSON.parse(fs.readFileSync(__dirname + '/server/json/requests.json', 'utf8'));
      requests.requests.push({ "Name": xss(uid), "IP": "test", "Lat": parseFloat(xss(lat)), "Lon": parseFloat(xss(lon)), "Time": new Date().getTime() });
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
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
// const fs = require('fs');
// const { MongoClient } = require('mongodb');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// MongoDB connection string example
/*
const uri = "mongodb+srv://dahonzak:ZIdfHxCB5kBVCBiC@newsletter.qphgh.mongodb.net/?retryWrites=true&w=majority&appName=Newsletter";
const client = new MongoClient(uri);
  
  let db;
const connectToDatabase = async () => {
  try {
    await client.connect();
    db = client.db('Newsletter');
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
  }
};
connectToDatabase();
*/

// Serve static files and set view engine (similar to your previous setup)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'client/pages'));
app.use('/js', express.static(path.join(__dirname, 'client/js')));
app.use('/css', express.static(path.join(__dirname, 'client/css')));
app.use('/pics', express.static(path.join(__dirname, 'client/pics')));

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

// Handle socket.io connections
io.on('connection', (socket) => {
  console.log('A user connected');
  // Event: User login
  socket.on('request', async () => {
    try {
      
    } catch (err) {
      socket.emit('error', { message: 'Error during login', error: err });
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});
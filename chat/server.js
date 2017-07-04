const express = require('express');
const path = require('path');

// Port
const port = 3000;

// setup Socket.io
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Static path
app.use(express.static(path.join(__dirname, 'public')));

// Index route
app.get('/', (req, res, next) => {
  res.send('Hello World');
});

server.listen(port, () => {
  console.log(`Server started on ${port}`);
});

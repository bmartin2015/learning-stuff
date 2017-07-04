const express = require('express');
const path = require('path');

// Port
const port = 3000;

// setup Socket.io
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

let users = [];

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Static path
app.use(express.static(path.join(__dirname, 'public')));

// Socket.io connect
io.sockets.on('connection', socket => {
  // set username
  socket.on('set user', (data, callback) => {
    if (users.indexOf(data) != -1) {
      callback(false);
    } else {
      callback(true);
      socket.username = data;
      users.push(socket.username);
      updateUsers();
    }
  });

  socket.on('send message', data => {
    io.sockets.emit('show message', { msg: data, user: socket.username });
  });

  socket.on('disconnect', data => {
    if (!socket.username) return;
    users.splice(users.indexOf(socket.username), 1);
    updateUsers();
  });

  function updateUsers() {
    io.sockets.emit('users', users);
  }
});

// Index route
app.get('/', (req, res, next) => {
  res.render('index');
});

server.listen(port, () => {
  console.log(`Server started on ${port}`);
});

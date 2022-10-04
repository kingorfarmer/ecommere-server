const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({ path: './config.env' });
const app = require('./app');
const http = require('http');
const socket = require('socket.io');
const { generateMessage } = require('./utils/message');
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require('./utils/users');

const server = http.createServer(app);
const io = new socket(server);

// server (emit) -> client (receive) - countUpdated
// client (emit) -> server (receive) - increment

io.on('connection', (socket) => {
  console.log('New websocket connection');

  socket.on('sendMessage', (message) => {
    const user = getUser(socket.id)
    io.to(user.room).emit('message', generateMessage(user.username,message));
  });

  socket.on('sendLocation', (coords) => {
    const user = getUser(socket.id)
    const location = `https://google.com/maps?q=${coords.latitude},${coords.longitude}`;
    io.to(user.room).emit('locationMessage', generateMessage(user.username, location));
  });

  socket.on('join', (options, handleError) => {
    const { error, user } = addUser({ id: socket.id, ...options });

    if (error) {
      return handleError(error);
    }

    socket.join(user.room);
    socket.emit('message', generateMessage('Admin', 'Welcome!'))
    socket.broadcast
      .to(user.room)
      .emit('message', generateMessage('Admin',`${user.username} has joined`));
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    })

    handleError();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id)

    if(user) {
      io.to(user.room).emit('message', generateMessage('Admin',`${user.username} has left`));
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      })
    }
  });
});

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

const port = process.env.PORT || 3000;
server.listen(port);

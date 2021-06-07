const http = require('http');
const express = require('express');
const path = require('path');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

const port = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, '../public')));

io.on('connection', (socket) => {
  socket.on('join', ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    if (error) return callback(error);

    socket.join(user.room);

    socket.emit('message', generateMessage(user.name, 'Welcome to the chat application!'));
    socket.broadcast.to(user.room).emit('message', generateMessage(user.name, `${user.name} has joined the room.`));

    callback();
  });

  socket.on('sendMessage', (message, callback) => {
    const filter = new Filter();
    const user = getUser(socket.id);

    if (!user) return callback('User is not found!');

    if (filter.isProfane(message)) return callback('Profanity is not allowed!');

    io.to(user.room).emit('message', generateMessage(user.name, message));
    callback();
  });

  socket.on('sendLocation', (data, callback) => {
    const user = getUser(socket.id);

    if (!user) return callback('User is not found!');

    io.to(user.room).emit(
      'locationMessage',
      generateLocationMessage(user.name, `https://google.com/maps?q=${data.latitude},${data.longitude}`),
    );
    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) io.to(user.room).emit('message', generateMessage(`${user.name} has left the chat room...`));
  });
});

server.listen(port, () => console.log(`Server listening on port ${port}`));

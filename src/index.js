const http = require('http');
const express = require('express');
const path = require('path');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');

const port = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, '../public')));

io.on('connection', (socket) => {
  socket.emit('message', generateMessage('Welcome!'));
  socket.broadcast.emit('message', generateMessage('A new user has joined...'));

  socket.on('sendMessage', (message, callback) => {
    const filter = new Filter();

    if (filter.isProfane(message)) return callback('Profanity is not allowed!');

    io.emit('message', generateMessage(message));
    callback();
  });

  socket.on('sendLocation', (data, callback) => {
    io.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${data.latitude},${data.longitude}`));
    callback();
  });

  socket.on('disconnect', () => socket.emit('message', generateMessage('A user has left...')));
});

server.listen(port, () => console.log(`Server listening on port ${port}`));

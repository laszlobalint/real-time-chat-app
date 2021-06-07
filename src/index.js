const http = require("http");
const express = require("express");
const path = require("path");
const socketio = require("socket.io");

const port = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, "../public")));

io.on("connection", (socket) => {
  console.log("New websocket connection...");

  socket.emit("message", "Welcome!");
  socket.broadcast.emit("message", "A new user has joined...");

  socket.on("sendMessage", (data) => io.emit("message", data));

  socket.on("sendLocation", (data) =>
    io.emit(
      "message",
      `https://google.com/maps?q=${data.latitude},${data.longitude}`
    )
  );

  socket.on("disconnect", () => socket.emit("message", "A user has left..."));
});

server.listen(port, () => console.log(`Server listening on port ${port}`));

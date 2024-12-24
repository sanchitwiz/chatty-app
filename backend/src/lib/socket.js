import { Server } from 'socket.io';
import http from 'http';
import express from 'express';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

export function getRecieversocketId(userId) {
  return userSocketMap[userId];
}

const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("A user connected ", socket.id);

  // Retrieve userId from the query string
  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  // Emit the updated list of online users to all connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Listen for the disconnect event
  socket.on("disconnect", () => {
    console.log("A user disconnected ", socket.id);

    // Remove the user from the userSocketMap
    if (userId) {
      delete userSocketMap[userId];
    }

    // Emit the updated list of online users
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };

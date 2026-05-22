const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

/** @type {Record<string, any>} */
const players = {};

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Send the new player a snapshot of all existing players
  socket.emit('init', players);

  // New player announces themselves
  socket.on('playerJoin', (playerData) => {
    players[socket.id] = { ...playerData, id: socket.id };
    socket.broadcast.emit('playerJoined', players[socket.id]);
  });

  // Player sends a position/velocity update each frame
  socket.on('playerUpdate', (data) => {
    if (players[socket.id]) {
      players[socket.id].pos = data.pos;
      players[socket.id].acc = data.acc;
      socket.broadcast.emit('playerMoved', {
        id: socket.id,
        pos: data.pos,
        acc: data.acc,
      });
    }
  });

  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    delete players[socket.id];
    io.emit('playerLeft', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Game server running on http://localhost:${PORT}`);
});

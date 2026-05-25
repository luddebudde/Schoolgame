const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();

// Serve the Vite-built frontend in production
app.use(express.static(path.join(__dirname, 'dist')));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

/** @type {Record<string, any>} */
const players = {};
let gameStarted = false;

function checkAllReady() {
  const list = Object.values(players);
  if (list.length >= 1 && list.every((p) => p.ready)) {
    gameStarted = true;
    io.emit('gameStart');
    console.log('All players ready — game started!');
  }
}

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Send the new player the current lobby/game state
  socket.emit('init', { players, gameStarted });

  // New player announces themselves
  socket.on('playerJoin', (playerData) => {
    players[socket.id] = { ...playerData, id: socket.id, ready: false };
    if (gameStarted) {
      // Game already running — add them directly and tell others
      socket.broadcast.emit('playerJoined', players[socket.id]);
    } else {
      // Still in lobby — broadcast updated player list to everyone
      io.emit('lobbyUpdate', players);
    }
  });

  // Player marks themselves as ready in the lobby
  socket.on('playerReady', () => {
    if (players[socket.id] && !gameStarted) {
      players[socket.id].ready = true;
      io.emit('lobbyUpdate', players);
      checkAllReady();
    }
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
    if (gameStarted) {
      io.emit('playerLeft', socket.id);
    } else {
      io.emit('lobbyUpdate', players);
    }
  });
});

// Fallback: serve index.html for any unmatched route
app.get('/{*path}', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Game server running on http://localhost:${PORT}`);
});

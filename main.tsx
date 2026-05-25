import { localPlayer, circles, remotePlayers } from "./player";
import { add, multVar } from "./vec";
import { handleWallBounce } from "./wallBounce";
import { io } from "socket.io-client";

const canvas = document.getElementById("game") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const world = { width: canvas.width, height: canvas.height };

// Start the player in the center of the screen
localPlayer.pos = { x: world.width / 2, y: world.height / 2 };

const airFriction = 0.98;

// --- Multiplayer ---
// io() with no args connects to the current page origin.
// Vite proxies /socket.io → localhost:3001, so only one port is ever needed
// (whether running locally, in a devcontainer, or accessed from another device).
const socket = io();

// --- Lobby UI ---
const lobbyOverlay = document.getElementById("lobby") as HTMLDivElement;
const playerListEl = document.getElementById("player-list") as HTMLDivElement;
const lobbyStatusEl = document.getElementById("lobby-status") as HTMLDivElement;
const readyBtn = document.getElementById("ready-btn") as HTMLButtonElement;

function updateLobbyUI(players: Record<string, any>) {
  const list = Object.values(players);
  playerListEl.innerHTML = list
    .map(
      (p) =>
        `<div class="player-entry${p.ready ? " ready" : ""}">
          <span class="player-name">${p.name}</span>
          <span class="player-status">${p.ready ? "✓ Ready" : "Not ready"}</span>
        </div>`
    )
    .join("");

  const readyCount = list.filter((p) => p.ready).length;
  const total = list.length;
  if (total === 0) {
    lobbyStatusEl.textContent = "Waiting for players to connect...";
  } else if (readyCount === total) {
    lobbyStatusEl.textContent = "All players ready! Starting...";
  } else {
    lobbyStatusEl.textContent = `${readyCount} / ${total} players ready`;
  }
}

let gameRunning = false;
function startGame() {
  if (gameRunning) return;
  gameRunning = true;
  lobbyOverlay.style.display = "none";
  gameLoop();
}

readyBtn.addEventListener("click", () => {
  readyBtn.disabled = true;
  readyBtn.textContent = "Waiting for others...";
  socket.emit("playerReady");
});

// --- Socket Events ---
socket.on("connect", () => {
  localPlayer.id = socket.id!;
  socket.emit("playerJoin", {
    name: localPlayer.name,
    color: localPlayer.color,
    radius: localPlayer.radius,
    speed: localPlayer.speed,
    pos: localPlayer.pos,
    acc: localPlayer.acc,
  });
});

socket.on("init", (data: { players: Record<string, any>; gameStarted: boolean }) => {
  for (const [id, p] of Object.entries(data.players)) {
    if (id !== socket.id) remotePlayers.set(id, { ...p, id });
  }
  if (data.gameStarted) {
    startGame();
  }
});

socket.on("lobbyUpdate", (players: Record<string, any>) => {
  remotePlayers.clear();
  for (const [id, p] of Object.entries(players)) {
    if (id !== socket.id) remotePlayers.set(id, { ...p, id });
  }
  updateLobbyUI(players);
});

socket.on("gameStart", () => {
  startGame();
});

socket.on("playerJoined", (data: any) => {
  remotePlayers.set(data.id, data);
});

socket.on("playerMoved", (data: { id: string; pos: any; acc: any }) => {
  const p = remotePlayers.get(data.id);
  if (p) {
    p.pos = data.pos;
    p.acc = data.acc;
  }
});

socket.on("playerLeft", (id: string) => {
  remotePlayers.delete(id);
});

// --- Game Loop ---
const gameLoop = () => {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (keys["w"]) localPlayer.acc.y -= localPlayer.speed;
  if (keys["a"]) localPlayer.acc.x -= localPlayer.speed;
  if (keys["s"]) localPlayer.acc.y += localPlayer.speed;
  if (keys["d"]) localPlayer.acc.x += localPlayer.speed;

  localPlayer.pos = add(localPlayer.pos, localPlayer.acc);
  localPlayer.acc = multVar(localPlayer.acc, airFriction);

  // Draw local player (with wall bounce)
  circles.forEach((circle) => {
    handleWallBounce(circle, world);

    ctx.beginPath();
    ctx.arc(circle.pos.x, circle.pos.y, circle.radius, 0, 2 * Math.PI);
    ctx.fillStyle = circle.color;
    ctx.fill();

    ctx.fillStyle = "white";
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(circle.name, circle.pos.x, circle.pos.y - circle.radius - 6);
  });

  // Draw remote players
  remotePlayers.forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.pos.x, p.pos.y, p.radius, 0, 2 * Math.PI);
    ctx.fillStyle = "red";
    ctx.fill();

    ctx.fillStyle = "white";
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(p.name, p.pos.x, p.pos.y - p.radius - 6);
  });

  // Send local player state to server each frame
  if (socket.connected) {
    socket.emit("playerUpdate", { pos: localPlayer.pos, acc: localPlayer.acc });
  }

  requestAnimationFrame(gameLoop);
};

// --- Input ---
const keys: { [key: string]: boolean } = {};

window.addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (e) => {
  keys[e.key.toLowerCase()] = false;
});

// Game loop is started by startGame() once the server emits "gameStart"

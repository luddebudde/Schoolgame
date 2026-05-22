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
// Connect to the game server on port 3001, using whatever hostname the browser used.
// This works on localhost AND on other devices by IP or hostname automatically.
const serverUrl = `${window.location.protocol}//${window.location.hostname}:3001`;
const socket = io(serverUrl);

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

socket.on("init", (players: Record<string, any>) => {
  for (const [id, data] of Object.entries(players)) {
    remotePlayers.set(id, { ...data, id });
  }
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
  circles.forEach(circle => {
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
  remotePlayers.forEach(p => {
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

const keys: { [key: string]: boolean } = {};

window.addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (e) => {
  keys[e.key.toLowerCase()] = false;
});

gameLoop();
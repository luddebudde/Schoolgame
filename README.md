# School Quiz Game 🏫

A real-time **multiplayer quiz game** built with **Vite + React + TypeScript** and WebSockets. Players join a lobby, answer school-subject trivia questions, and compete for the top score.

## Getting Started

### Prerequisites
- Node.js 18+

### Install dependencies
```bash
npm install
```

### Run in development
```bash
npm run dev
```
This starts both the WebSocket game server (`ws://localhost:8080`) and the Vite dev server (`http://localhost:5173`) concurrently.

Open **multiple browser tabs** at `http://localhost:5173` to simulate multiple players joining the lobby!

## How to Play

1. Open the game in your browser and enter a name to join the lobby.
2. Any player in the lobby can press **Start Game**.
3. Answer each question before the 15-second timer runs out — faster correct answers earn more points.
4. After all questions the **scoreboard** is shown. Press **Play Again** to return to the lobby.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start game server + Vite dev server |
| `npm run server` | Start only the WebSocket game server |
| `npm run build` | TypeScript check + production build |
| `npm run lint` | ESLint |
| `npm run preview` | Preview the production build |

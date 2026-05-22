import { WebSocketServer, WebSocket } from 'ws';

const PORT = 8080;
const wss = new WebSocketServer({ port: PORT });

const QUESTIONS = [
  { q: 'What is 7 × 8?', options: ['54', '56', '64', '48'], answer: 1 },
  { q: 'What is the chemical symbol for water?', options: ['H2O', 'CO2', 'O2', 'H2'], answer: 0 },
  { q: 'Who wrote Romeo and Juliet?', options: ['Dickens', 'Tolstoy', 'Shakespeare', 'Austen'], answer: 2 },
  { q: 'What is the capital of France?', options: ['Berlin', 'Madrid', 'Rome', 'Paris'], answer: 3 },
  { q: 'What is √144?', options: ['11', '12', '13', '14'], answer: 1 },
  { q: 'How many planets are in our solar system?', options: ['7', '8', '9', '10'], answer: 1 },
  { q: 'What gas do plants absorb from the air?', options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'], answer: 2 },
  { q: 'In which year did World War II end?', options: ['1943', '1944', '1945', '1946'], answer: 2 },
  { q: 'What is the longest river in the world?', options: ['Amazon', 'Nile', 'Yangtze', 'Mississippi'], answer: 1 },
  { q: 'What is the powerhouse of the cell?', options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Vacuole'], answer: 2 },
];

/** @type {Map<string, {name: string, score: number, answered: boolean, ws: WebSocket}>} */
const players = new Map();

let gameState = 'lobby'; // 'lobby' | 'playing' | 'results'
let currentQuestion = 0;
let questionTimer = null;
let answerDeadline = 0;

function broadcast(data) {
  const msg = JSON.stringify(data);
  for (const player of players.values()) {
    if (player.ws.readyState === WebSocket.OPEN) {
      player.ws.send(msg);
    }
  }
}

function sendLobbyState() {
  broadcast({
    type: 'lobby',
    players: [...players.values()].map(p => ({ name: p.name, score: p.score })),
  });
}

function sendQuestion() {
  if (currentQuestion >= QUESTIONS.length) {
    endGame();
    return;
  }
  // Reset answered flag
  for (const player of players.values()) {
    player.answered = false;
  }
  answerDeadline = Date.now() + 15000;
  broadcast({
    type: 'question',
    index: currentQuestion,
    total: QUESTIONS.length,
    question: QUESTIONS[currentQuestion].q,
    options: QUESTIONS[currentQuestion].options,
    deadline: answerDeadline,
  });
  questionTimer = setTimeout(() => advanceQuestion(), 15000);
}

function advanceQuestion() {
  clearTimeout(questionTimer);
  currentQuestion++;
  sendQuestion();
}

function endGame() {
  gameState = 'results';
  const scores = [...players.values()]
    .map(p => ({ name: p.name, score: p.score }))
    .sort((a, b) => b.score - a.score);
  broadcast({ type: 'results', scores });
}

function startGame() {
  if (players.size < 1) return;
  gameState = 'playing';
  currentQuestion = 0;
  for (const player of players.values()) {
    player.score = 0;
    player.answered = false;
  }
  broadcast({ type: 'start', total: QUESTIONS.length });
  setTimeout(() => sendQuestion(), 1000);
}

wss.on('connection', (ws) => {
  let playerId = null;

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { return; }

    if (msg.type === 'join') {
      const name = String(msg.name || '').trim().slice(0, 20);
      if (!name) { ws.send(JSON.stringify({ type: 'error', message: 'Name is required' })); return; }
      playerId = `${name}-${Date.now()}`;
      players.set(playerId, { name, score: 0, answered: false, ws });
      ws.send(JSON.stringify({ type: 'joined', id: playerId, name }));
      if (gameState === 'lobby') {
        sendLobbyState();
      } else {
        // Late joiner gets the current question
        ws.send(JSON.stringify({ type: 'late' }));
      }
      return;
    }

    if (!playerId || !players.has(playerId)) return;
    const player = players.get(playerId);

    if (msg.type === 'start' && gameState === 'lobby') {
      startGame();
      return;
    }

    if (msg.type === 'answer' && gameState === 'playing') {
      if (player.answered) return;
      player.answered = true;
      const correct = QUESTIONS[currentQuestion]?.answer === msg.option;
      if (correct) {
        const timeLeft = Math.max(0, answerDeadline - Date.now());
        player.score += 100 + Math.floor(timeLeft / 100);
      }
      ws.send(JSON.stringify({ type: 'answerResult', correct, correctOption: QUESTIONS[currentQuestion]?.answer }));

      // Check if all answered
      const allAnswered = [...players.values()].every(p => p.answered);
      if (allAnswered) {
        clearTimeout(questionTimer);
        setTimeout(() => advanceQuestion(), 2000);
      }
      return;
    }

    if (msg.type === 'restart' && gameState === 'results') {
      gameState = 'lobby';
      for (const p of players.values()) p.score = 0;
      sendLobbyState();
      return;
    }
  });

  ws.on('close', () => {
    if (playerId) {
      players.delete(playerId);
      if (gameState === 'lobby') sendLobbyState();
    }
  });
});

console.log(`🎮 Schoolgame WebSocket server running on ws://localhost:${PORT}`);

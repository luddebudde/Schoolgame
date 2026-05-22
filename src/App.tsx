import { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'

const WS_URL = 'ws://localhost:8080'

type Screen =
  | 'connect'
  | 'lobby'
  | 'playing'
  | 'answer-result'
  | 'results'
  | 'late'
  | 'disconnected'

interface Player {
  name: string
  score: number
}

interface QuestionData {
  index: number
  total: number
  question: string
  options: string[]
  deadline: number
}

interface ResultsData {
  scores: Player[]
}

function useCountdown(deadline: number): number {
  const [timeLeft, setTimeLeft] = useState(0)
  useEffect(() => {
    if (!deadline) return
    const tick = () => setTimeLeft(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)))
    tick()
    const id = setInterval(tick, 200)
    return () => clearInterval(id)
  }, [deadline])
  return timeLeft
}

export default function App() {
  const ws = useRef<WebSocket | null>(null)
  const [screen, setScreen] = useState<Screen>('connect')
  const [nameInput, setNameInput] = useState('')
  const [myName, setMyName] = useState('')
  const [players, setPlayers] = useState<Player[]>([])
  const [question, setQuestion] = useState<QuestionData | null>(null)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [correct, setCorrect] = useState<boolean | null>(null)
  const [correctOption, setCorrectOption] = useState<number | null>(null)
  const [results, setResults] = useState<ResultsData | null>(null)
  const [error, setError] = useState('')
  const timeLeft = useCountdown(question?.deadline ?? 0)

  const send = useCallback((data: object) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data))
    }
  }, [])

  const connect = useCallback((name: string) => {
    const socket = new WebSocket(WS_URL)
    ws.current = socket

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: 'join', name }))
    }

    socket.onmessage = (evt) => {
      const msg = JSON.parse(evt.data as string)

      if (msg.type === 'joined') {
        setMyName(msg.name as string)
      } else if (msg.type === 'lobby') {
        setPlayers(msg.players as Player[])
        setScreen('lobby')
      } else if (msg.type === 'start') {
        setScreen('playing')
        setQuestion(null)
        setSelectedOption(null)
        setCorrect(null)
        setCorrectOption(null)
      } else if (msg.type === 'question') {
        setQuestion(msg as QuestionData)
        setSelectedOption(null)
        setCorrect(null)
        setCorrectOption(null)
        setScreen('playing')
      } else if (msg.type === 'answerResult') {
        setCorrect(msg.correct as boolean)
        setCorrectOption(msg.correctOption as number)
        setScreen('answer-result')
      } else if (msg.type === 'results') {
        setResults(msg as ResultsData)
        setScreen('results')
      } else if (msg.type === 'late') {
        setScreen('late')
      } else if (msg.type === 'error') {
        setError(msg.message as string)
      }
    }

    socket.onclose = () => {
      setScreen('disconnected')
    }

    socket.onerror = () => {
      setError('Could not connect to game server. Make sure "npm run server" is running.')
    }
  }, [])

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault()
    const name = nameInput.trim()
    if (!name) return
    setError('')
    connect(name)
  }

  const handleAnswer = (index: number) => {
    if (selectedOption !== null) return
    setSelectedOption(index)
    send({ type: 'answer', option: index })
  }

  const optionClass = (i: number) => {
    const base = 'option-btn'
    if (screen === 'answer-result') {
      if (i === correctOption) return `${base} correct`
      if (i === selectedOption && !correct) return `${base} wrong`
      return `${base} dimmed`
    }
    if (selectedOption === i) return `${base} selected`
    return base
  }

  if (screen === 'connect' || screen === 'disconnected') {
    return (
      <div className="screen center-screen">
        <div className="card">
          <h1>🏫 School Quiz</h1>
          <p className="subtitle">Multiplayer classroom trivia game</p>
          {screen === 'disconnected' && (
            <p className="error-msg">Disconnected from server.</p>
          )}
          {error && <p className="error-msg">{error}</p>}
          <form onSubmit={handleJoin} className="join-form">
            <input
              type="text"
              placeholder="Enter your name"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              maxLength={20}
              className="name-input"
              autoFocus
            />
            <button type="submit" className="btn primary">
              Join Game
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (screen === 'late') {
    return (
      <div className="screen center-screen">
        <div className="card">
          <h2>⏰ Game in progress</h2>
          <p>A game is already running. Please wait for the next round.</p>
        </div>
      </div>
    )
  }

  if (screen === 'lobby') {
    return (
      <div className="screen center-screen">
        <div className="card lobby-card">
          <h1>🏫 School Quiz</h1>
          <p className="subtitle">Waiting for players…</p>
          <div className="player-list">
            {players.map((p, i) => (
              <div key={i} className={`player-chip ${p.name === myName ? 'me' : ''}`}>
                {p.name === myName ? '⭐ ' : ''}
                {p.name}
              </div>
            ))}
          </div>
          <p className="hint">{players.length} player{players.length !== 1 ? 's' : ''} in lobby</p>
          <button className="btn primary" onClick={() => send({ type: 'start' })}>
            Start Game
          </button>
        </div>
      </div>
    )
  }

  if (screen === 'playing' || screen === 'answer-result') {
    if (!question) {
      return (
        <div className="screen center-screen">
          <div className="card">
            <p className="loading">Get ready…</p>
          </div>
        </div>
      )
    }
    return (
      <div className="screen question-screen">
        <div className="question-header">
          <span className="q-counter">
            Question {question.index + 1} / {question.total}
          </span>
          <span className={`timer ${timeLeft <= 5 ? 'urgent' : ''}`}>
            ⏱ {timeLeft}s
          </span>
        </div>

        <div className="question-text">{question.question}</div>

        <div className="options-grid">
          {question.options.map((opt, i) => (
            <button
              key={i}
              className={optionClass(i)}
              onClick={() => handleAnswer(i)}
              disabled={selectedOption !== null}
            >
              <span className="option-letter">{['A', 'B', 'C', 'D'][i]}</span>
              {opt}
            </button>
          ))}
        </div>

        {screen === 'answer-result' && (
          <div className={`result-banner ${correct ? 'correct-banner' : 'wrong-banner'}`}>
            {correct ? '✅ Correct! +points' : `❌ Wrong! Correct answer: ${question.options[correctOption!]}`}
          </div>
        )}
      </div>
    )
  }

  if (screen === 'results' && results) {
    const myRank = results.scores.findIndex(p => p.name === myName) + 1
    return (
      <div className="screen center-screen">
        <div className="card results-card">
          <h1>🏆 Results</h1>
          {myRank > 0 && (
            <p className="my-rank">
              You finished {myRank === 1 ? '🥇 1st' : myRank === 2 ? '🥈 2nd' : myRank === 3 ? '🥉 3rd' : `${myRank}th`}!
            </p>
          )}
          <ol className="scoreboard">
            {results.scores.map((p, i) => (
              <li key={i} className={`score-row ${p.name === myName ? 'me' : ''}`}>
                <span className="rank">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                </span>
                <span className="player-name">{p.name}</span>
                <span className="player-score">{p.score} pts</span>
              </li>
            ))}
          </ol>
          <button className="btn primary" onClick={() => send({ type: 'restart' })}>
            Play Again
          </button>
        </div>
      </div>
    )
  }

  return null
}

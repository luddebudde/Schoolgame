import { useState, useEffect, useCallback } from 'react'

interface GameProps {
  playerName: string
  roomCode: string
  onLeave: () => void
}

interface Player {
  id: string
  name: string
  x: number
  y: number
  color: string
}

const COLORS = ['#e94560', '#4ade80', '#60a5fa', '#f59e0b', '#a78bfa', '#fb7185']

function makePlayer(name: string, index: number): Player {
  return {
    id: crypto.randomUUID(),
    name,
    x: 20 + (index % 3) * 30,
    y: 20 + Math.floor(index / 3) * 40,
    color: COLORS[index % COLORS.length],
  }
}

function Game({ playerName, roomCode, onLeave }: GameProps) {
  const [players, setPlayers] = useState<Player[]>([makePlayer(playerName, 0)])
  const [myId] = useState(() => players[0].id)

  // Simulate other players joining after a short delay
  useEffect(() => {
    if (!roomCode) return
    const timer = setTimeout(() => {
      setPlayers((prev) => [
        ...prev,
        makePlayer('Bot_1', 1),
        makePlayer('Bot_2', 2),
      ])
    }, 1200)
    return () => clearTimeout(timer)
  }, [roomCode])

  const movePlayer = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const xPct = ((e.clientX - rect.left) / rect.width) * 100
      const yPct = ((e.clientY - rect.top) / rect.height) * 100
      setPlayers((prev) =>
        prev.map((p) =>
          p.id === myId ? { ...p, x: Math.min(90, Math.max(2, xPct)), y: Math.min(90, Math.max(2, yPct)) } : p,
        ),
      )
    },
    [myId],
  )

  return (
    <div className="game">
      <div className="game-header">
        <h2>🏫 Schoolgame</h2>
        <span className="room-info">
          {roomCode ? `Room: ${roomCode} · ${players.length} player${players.length !== 1 ? 's' : ''}` : 'Solo mode'}
        </span>
        <button className="btn btn-secondary" style={{ padding: '0.4rem 0.9rem', fontSize: '0.9rem' }} onClick={onLeave}>
          Leave
        </button>
      </div>

      <div className="game-arena" onClick={movePlayer} title="Click to move">
        {players.map((p) => (
          <div
            key={p.id}
            className="player-dot"
            style={{
              background: p.color,
              left: `${p.x}%`,
              top: `${p.y}%`,
              transform: 'translate(-50%, -50%)',
              outline: p.id === myId ? `3px solid white` : 'none',
            }}
            title={p.name}
          >
            {p.name.slice(0, 3)}
          </div>
        ))}
      </div>

      <p className="controls-hint">Click anywhere in the arena to move your character</p>
    </div>
  )
}

export default Game

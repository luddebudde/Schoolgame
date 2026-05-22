import { useState } from 'react'

interface NetworkLobbyProps {
  onJoin: (playerName: string, roomCode: string) => void
  onBack: () => void
}

function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

function NetworkLobby({ onJoin, onBack }: NetworkLobbyProps) {
  const [playerName, setPlayerName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose')
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')

  const handleCreate = () => {
    if (!playerName.trim()) {
      setError('Please enter your name first.')
      return
    }
    const code = generateRoomCode()
    setError('')
    setStatus(`Room created! Code: ${code} — share it with friends.`)
    // Give user a moment to see the code, then enter the game
    setTimeout(() => {
      onJoin(playerName.trim(), code)
    }, 1500)
  }

  const handleJoin = () => {
    if (!playerName.trim()) {
      setError('Please enter your name.')
      return
    }
    if (roomCode.trim().length < 4) {
      setError('Please enter a valid room code.')
      return
    }
    setError('')
    setStatus('Joining room…')
    setTimeout(() => {
      onJoin(playerName.trim(), roomCode.trim().toUpperCase())
    }, 800)
  }

  return (
    <div className="lobby">
      <h2>🌐 Multiplayer Lobby</h2>

      {mode === 'choose' && (
        <>
          <div className="lobby-form">
            <label>
              Your name
              <input
                type="text"
                placeholder="e.g. Alex"
                value={playerName}
                maxLength={20}
                onChange={(e) => setPlayerName(e.target.value)}
              />
            </label>
            {error && <p className="error">{error}</p>}
          </div>
          <div className="menu-buttons">
            <button
              className="btn btn-primary"
              onClick={() => {
                if (!playerName.trim()) {
                  setError('Please enter your name first.')
                  return
                }
                setError('')
                setMode('create')
              }}
            >
              🏠 Create Room
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                if (!playerName.trim()) {
                  setError('Please enter your name first.')
                  return
                }
                setError('')
                setMode('join')
              }}
            >
              🚪 Join Room
            </button>
          </div>
        </>
      )}

      {mode === 'create' && (
        <div className="lobby-form">
          <p style={{ color: '#aaa', fontSize: '0.95rem' }}>
            A room code will be generated for you to share with friends.
          </p>
          {status && <p className="status">{status}</p>}
          {error && <p className="error">{error}</p>}
          <button className="btn btn-primary" onClick={handleCreate}>
            ✅ Create & Start
          </button>
          <button className="btn btn-secondary" onClick={() => setMode('choose')}>
            ← Back
          </button>
        </div>
      )}

      {mode === 'join' && (
        <div className="lobby-form">
          <label>
            Room code
            <input
              type="text"
              placeholder="e.g. AB12CD"
              value={roomCode}
              maxLength={8}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            />
          </label>
          {status && <p className="status">{status}</p>}
          {error && <p className="error">{error}</p>}
          <button className="btn btn-primary" onClick={handleJoin}>
            🚀 Join Game
          </button>
          <button className="btn btn-secondary" onClick={() => setMode('choose')}>
            ← Back
          </button>
        </div>
      )}

      <button className="btn btn-secondary" style={{ marginTop: '0.5rem' }} onClick={onBack}>
        ← Main Menu
      </button>
    </div>
  )
}

export default NetworkLobby

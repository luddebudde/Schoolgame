import { useState, useCallback } from 'react'
import './App.css'
import Game from './Game'
import NetworkLobby from './NetworkLobby'

type Screen = 'menu' | 'network' | 'game'

function App() {
  const [screen, setScreen] = useState<Screen>('menu')
  const [playerName, setPlayerName] = useState('')
  const [roomCode, setRoomCode] = useState('')

  const handleJoinGame = useCallback((name: string, code: string) => {
    setPlayerName(name)
    setRoomCode(code)
    setScreen('game')
  }, [])

  if (screen === 'game') {
    return (
      <Game
        playerName={playerName}
        roomCode={roomCode}
        onLeave={() => setScreen('menu')}
      />
    )
  }

  if (screen === 'network') {
    return (
      <NetworkLobby
        onJoin={handleJoinGame}
        onBack={() => setScreen('menu')}
      />
    )
  }

  return (
    <div className="menu">
      <h1 className="title">🏫 Schoolgame</h1>
      <p className="subtitle">A multiplayer school adventure</p>
      <div className="menu-buttons">
        <button className="btn btn-primary" onClick={() => setScreen('network')}>
          🌐 Network (Multiplayer)
        </button>
        <button className="btn btn-secondary" onClick={() => setScreen('game')}>
          🎮 Solo Practice
        </button>
      </div>
    </div>
  )
}

export default App

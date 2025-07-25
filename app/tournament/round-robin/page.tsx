"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Player {
  id: string
  name: string
  score: number
  isHost: boolean
}

export default function RoundRobinPage() {
  const router = useRouter()
  const [gameCode, setGameCode] = useState("")
  const [playerName, setPlayerName] = useState("")
  const [isHost, setIsHost] = useState(false)
  const [players, setPlayers] = useState<Player[]>([])
  const [gameSettings, setGameSettings] = useState({
    questionsPerRound: 10,
    timePerQuestion: 30,
    totalRounds: 3,
    difficulty: "Mixed" as "Basic" | "Intermediate" | "Advanced" | "Mixed"
  })

  // Generate random game code
  const generateGameCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  const createGame = () => {
    const code = generateGameCode()
    setGameCode(code)
    setIsHost(true)
    const hostPlayer: Player = {
      id: "host",
      name: playerName || "Host",
      score: 0,
      isHost: true
    }
    setPlayers([hostPlayer])
  }

  const joinGame = () => {
    if (gameCode && playerName) {
      // In a real implementation, this would connect to a server
      const newPlayer: Player = {
        id: Math.random().toString(36).substring(2, 9),
        name: playerName,
        score: 0,
        isHost: false
      }
      setPlayers(prev => [...prev, newPlayer])
    }
  }

  const startTournament = () => {
    if (players.length >= 2) {
      // Store game data in sessionStorage for the game component
      sessionStorage.setItem('tournament-type', 'round-robin')
      sessionStorage.setItem('game-code', gameCode)
      sessionStorage.setItem('players', JSON.stringify(players))
      sessionStorage.setItem('game-settings', JSON.stringify(gameSettings))
      router.push('/tournament/game/round-robin')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🔄 Round Robin Tournament</h1>
          <p className="text-lg text-gray-600">Kahoot-style integration competition</p>
        </div>

        {!gameCode ? (
          /* Initial Setup */
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Create Game */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">🎯 Create Tournament</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={createGame}
                  disabled={!playerName.trim()}
                  className="w-full px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-300 font-medium transition-all shadow-md"
                >
                  🚀 Create Tournament
                </button>
              </div>

              {/* Join Game */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">🎮 Join Tournament</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Game Code</label>
                  <input
                    type="text"
                    value={gameCode}
                    onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                    placeholder="Enter game code"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-center text-lg"
                    maxLength={6}
                  />
                </div>

                <button
                  onClick={joinGame}
                  disabled={!playerName.trim() || !gameCode.trim()}
                  className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 font-medium transition-all shadow-md"
                >
                  🎯 Join Tournament
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Game Lobby */
          <div className="space-y-8">
            {/* Game Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Tournament Lobby</h2>
                <div className="text-2xl font-mono bg-purple-100 text-purple-800 px-6 py-3 rounded-lg inline-block">
                  Game Code: {gameCode}
                </div>
              </div>

              {isHost && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">🛠️ Tournament Settings</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Questions per Round</label>
                      <select
                        value={gameSettings.questionsPerRound}
                        onChange={(e) => setGameSettings(prev => ({...prev, questionsPerRound: parseInt(e.target.value)}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      >
                        <option value={5}>5 Questions</option>
                        <option value={10}>10 Questions</option>
                        <option value={15}>15 Questions</option>
                        <option value={20}>20 Questions</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time per Question</label>
                      <select
                        value={gameSettings.timePerQuestion}
                        onChange={(e) => setGameSettings(prev => ({...prev, timePerQuestion: parseInt(e.target.value)}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      >
                        <option value={15}>15 seconds</option>
                        <option value={30}>30 seconds</option>
                        <option value={45}>45 seconds</option>
                        <option value={60}>60 seconds</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Total Rounds</label>
                      <select
                        value={gameSettings.totalRounds}
                        onChange={(e) => setGameSettings(prev => ({...prev, totalRounds: parseInt(e.target.value)}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      >
                        <option value={1}>1 Round</option>
                        <option value={3}>3 Rounds</option>
                        <option value={5}>5 Rounds</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                      <select
                        value={gameSettings.difficulty}
                        onChange={(e) => setGameSettings(prev => ({...prev, difficulty: e.target.value as any}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="Basic">Basic</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Mixed">Mixed</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Players List */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                👥 Players ({players.length}/20)
              </h3>
              
              <div className="grid gap-3">
                {players.map((player, index) => (
                  <div key={player.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-800">{player.name}</span>
                      {player.isHost && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                          👑 Host
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">Ready</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center text-gray-500">
                Share the game code <strong>{gameCode}</strong> with others to join!
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push("/tournament")}
                className="px-8 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 font-medium transition-all shadow-md"
              >
                ← Back
              </button>
              
              {isHost && (
                <button
                  onClick={startTournament}
                  disabled={players.length < 2}
                  className={`
                    px-12 py-3 rounded-xl font-bold text-lg transition-all shadow-md
                    ${
                      players.length >= 2
                        ? "bg-purple-500 hover:bg-purple-600 text-white hover:scale-105"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }
                  `}
                >
                  🚀 Start Tournament
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

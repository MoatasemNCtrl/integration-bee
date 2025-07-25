"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Player {
  id: string
  name: string
  isEliminated: boolean
  currentRound: number
}

interface Match {
  id: string
  player1: Player
  player2: Player
  winner?: Player
  round: number
}

export default function KnockoutPage() {
  const router = useRouter()
  const [gameCode, setGameCode] = useState("")
  const [playerName, setPlayerName] = useState("")
  const [isHost, setIsHost] = useState(false)
  const [players, setPlayers] = useState<Player[]>([])
  const [gameSettings, setGameSettings] = useState({
    questionsPerMatch: 5,
    timePerQuestion: 45,
    difficulty: "Mixed" as "Basic" | "Intermediate" | "Advanced" | "Mixed",
    tournamentSize: 8
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
      isEliminated: false,
      currentRound: 1
    }
    setPlayers([hostPlayer])
  }

  const joinGame = () => {
    if (gameCode && playerName) {
      const newPlayer: Player = {
        id: Math.random().toString(36).substring(2, 9),
        name: playerName,
        isEliminated: false,
        currentRound: 1
      }
      setPlayers(prev => [...prev, newPlayer])
    }
  }

  const generateBracket = () => {
    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5)
    const matches: Match[] = []
    
    for (let i = 0; i < shuffledPlayers.length; i += 2) {
      if (i + 1 < shuffledPlayers.length) {
        matches.push({
          id: `match-${i/2}`,
          player1: shuffledPlayers[i],
          player2: shuffledPlayers[i + 1],
          round: 1
        })
      }
    }
    
    return matches
  }

  const startTournament = () => {
    if (players.length >= 4 && players.length <= 16) {
      const bracket = generateBracket()
      sessionStorage.setItem('tournament-type', 'knockout')
      sessionStorage.setItem('game-code', gameCode)
      sessionStorage.setItem('players', JSON.stringify(players))
      sessionStorage.setItem('game-settings', JSON.stringify(gameSettings))
      sessionStorage.setItem('bracket', JSON.stringify(bracket))
      router.push('/tournament/game/knockout')
    }
  }

  const getTournamentRounds = (playerCount: number) => {
    return Math.ceil(Math.log2(playerCount))
  }

  const isPowerOfTwo = (n: number) => {
    return n > 0 && (n & (n - 1)) === 0
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">⚔️ Knockout Tournament</h1>
          <p className="text-lg text-gray-600">Head-to-head elimination bracket</p>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={createGame}
                  disabled={!playerName.trim()}
                  className="w-full px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 font-medium transition-all shadow-md"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Game Code</label>
                  <input
                    type="text"
                    value={gameCode}
                    onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                    placeholder="Enter game code"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono text-center text-lg"
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
                <div className="text-2xl font-mono bg-red-100 text-red-800 px-6 py-3 rounded-lg inline-block">
                  Game Code: {gameCode}
                </div>
              </div>

              {isHost && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">⚙️ Tournament Settings</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Questions per Match</label>
                      <select
                        value={gameSettings.questionsPerMatch}
                        onChange={(e) => setGameSettings(prev => ({...prev, questionsPerMatch: parseInt(e.target.value)}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      >
                        <option value={3}>3 Questions (Quick)</option>
                        <option value={5}>5 Questions (Standard)</option>
                        <option value={7}>7 Questions (Extended)</option>
                        <option value={10}>10 Questions (Marathon)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time per Question</label>
                      <select
                        value={gameSettings.timePerQuestion}
                        onChange={(e) => setGameSettings(prev => ({...prev, timePerQuestion: parseInt(e.target.value)}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      >
                        <option value={30}>30 seconds</option>
                        <option value={45}>45 seconds</option>
                        <option value={60}>60 seconds</option>
                        <option value={90}>90 seconds</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                      <select
                        value={gameSettings.difficulty}
                        onChange={(e) => setGameSettings(prev => ({...prev, difficulty: e.target.value as any}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      >
                        <option value="Basic">Basic</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Mixed">Mixed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tournament Size</label>
                      <select
                        value={gameSettings.tournamentSize}
                        onChange={(e) => setGameSettings(prev => ({...prev, tournamentSize: parseInt(e.target.value)}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      >
                        <option value={4}>4 Players (2 rounds)</option>
                        <option value={8}>8 Players (3 rounds)</option>
                        <option value={16}>16 Players (4 rounds)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Tournament Bracket Preview */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">🏆 Tournament Bracket</h3>
              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
                  <span className="text-sm text-gray-600">
                    {getTournamentRounds(gameSettings.tournamentSize)} rounds • Single elimination
                  </span>
                </div>
              </div>
              
              <div className="text-center text-gray-500 mb-4">
                Bracket will be generated when tournament starts
              </div>
            </div>

            {/* Players List */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                👥 Players ({players.length}/{gameSettings.tournamentSize})
              </h3>
              
              <div className="grid gap-3">
                {players.map((player, index) => (
                  <div key={player.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-800">{player.name}</span>
                      {index === 0 && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                          👑 Host
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">Ready</div>
                  </div>
                ))}
                
                {/* Empty slots */}
                {Array.from({length: gameSettings.tournamentSize - players.length}).map((_, index) => (
                  <div key={`empty-${index}`} className="flex items-center justify-between p-4 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center font-bold">
                        {players.length + index + 1}
                      </div>
                      <span className="text-gray-500 italic">Waiting for player...</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center text-gray-500">
                Share the game code <strong>{gameCode}</strong> with others to join!
              </div>

              {!isPowerOfTwo(players.length) && players.length >= 4 && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <span>⚠️</span>
                    <span className="text-sm">
                      Tournament works best with {Math.pow(2, Math.ceil(Math.log2(players.length)))} players. 
                      Some players may get a bye in the first round.
                    </span>
                  </div>
                </div>
              )}
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
                  disabled={players.length < 4 || players.length > 16}
                  className={`
                    px-12 py-3 rounded-xl font-bold text-lg transition-all shadow-md
                    ${
                      players.length >= 4 && players.length <= 16
                        ? "bg-red-500 hover:bg-red-600 text-white hover:scale-105"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }
                  `}
                >
                  ⚔️ Start Tournament
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

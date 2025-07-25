"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function OneVOnePage() {
  const router = useRouter()
  const [gameCode, setGameCode] = useState("")
  const [playerName, setPlayerName] = useState("")
  const [isHost, setIsHost] = useState(false)
  const [isWaiting, setIsWaiting] = useState(false)
  const [opponent, setOpponent] = useState<string | null>(null)
  const [gameSettings, setGameSettings] = useState({
    questionsToWin: 5,
    timePerQuestion: 45,
    difficulty: "Mixed" as "Basic" | "Intermediate" | "Advanced" | "Mixed"
  })

  // Generate random game code
  const generateGameCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  const createGame = () => {
    if (!playerName.trim()) return
    
    const code = generateGameCode()
    setGameCode(code)
    setIsHost(true)
    setIsWaiting(true)
  }

  const joinGame = () => {
    if (!gameCode.trim() || !playerName.trim()) return
    
    // In a real implementation, this would connect to a server
    setOpponent("Host Player") // Simulated opponent
    setIsWaiting(false)
    // Auto-start the game after joining
    startDuel()
  }

  const startDuel = () => {
    // Store game data in sessionStorage for the game component
    sessionStorage.setItem('duel-type', '1v1')
    sessionStorage.setItem('game-code', gameCode)
    sessionStorage.setItem('player-name', playerName)
    sessionStorage.setItem('is-host', isHost.toString())
    sessionStorage.setItem('opponent', opponent || 'Opponent')
    sessionStorage.setItem('game-settings', JSON.stringify(gameSettings))
    router.push('/1v1/game')
  }

  const simulateOpponentJoin = () => {
    // Simulate an opponent joining for demo purposes
    setOpponent("Challenge Accepted!")
    setIsWaiting(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">⚔️ 1v1 Integration Duel</h1>
          <p className="text-xl text-gray-600">Challenge a friend to an integration showdown!</p>
        </div>

        {!isWaiting && !opponent ? (
          /* Initial Setup */
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Create Game */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">🎯 Create Duel</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={createGame}
                  disabled={!playerName.trim()}
                  className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 font-medium transition-all shadow-md"
                >
                  ⚔️ Create Duel
                </button>
              </div>

              {/* Join Game */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">🎮 Join Duel</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duel Code</label>
                  <input
                    type="text"
                    value={gameCode}
                    onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                    placeholder="Enter duel code"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-center text-lg"
                    maxLength={6}
                  />
                </div>

                <button
                  onClick={joinGame}
                  disabled={!playerName.trim() || !gameCode.trim()}
                  className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 font-medium transition-all shadow-md"
                >
                  ⚡ Accept Challenge
                </button>
              </div>
            </div>
          </div>
        ) : isWaiting ? (
          /* Waiting for Opponent */
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">⏳ Waiting for Challenger</h2>
            
            <div className="text-2xl font-mono bg-orange-100 text-orange-800 px-6 py-3 rounded-lg inline-block mb-6">
              Duel Code: {gameCode}
            </div>

            {isHost && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">⚙️ Duel Settings</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Questions to Win</label>
                    <select
                      value={gameSettings.questionsToWin}
                      onChange={(e) => setGameSettings(prev => ({...prev, questionsToWin: parseInt(e.target.value)}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    >
                      <option value={3}>First to 3</option>
                      <option value={5}>First to 5</option>
                      <option value={7}>First to 7</option>
                      <option value={10}>First to 10</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time per Question</label>
                    <select
                      value={gameSettings.timePerQuestion}
                      onChange={(e) => setGameSettings(prev => ({...prev, timePerQuestion: parseInt(e.target.value)}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
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

            <div className="space-y-4">
              <p className="text-gray-600 mb-6">
                Share the duel code <strong>{gameCode}</strong> with your opponent!
              </p>
              
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => {
                    setIsWaiting(false)
                    setGameCode("")
                    setIsHost(false)
                  }}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium transition-all shadow-md"
                >
                  ← Cancel
                </button>
                
                {/* Demo button for testing */}
                <button
                  onClick={simulateOpponentJoin}
                  className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-medium transition-all shadow-md"
                >
                  🤖 Add Bot Opponent (Demo)
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Opponent Found - Ready to Start */
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">🔥 Duel Ready!</h2>
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="text-4xl mb-2">👤</div>
                <h3 className="text-xl font-bold text-gray-800">{playerName}</h3>
                <p className="text-gray-600">You</p>
              </div>
              
              <div className="bg-red-50 rounded-lg p-6">
                <div className="text-4xl mb-2">⚔️</div>
                <h3 className="text-xl font-bold text-gray-800">{opponent}</h3>
                <p className="text-gray-600">Opponent</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">🎯 Duel Rules</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <strong>Victory:</strong> First to {gameSettings.questionsToWin} correct answers
                </div>
                <div>
                  <strong>Time Limit:</strong> {gameSettings.timePerQuestion} seconds per question
                </div>
                <div>
                  <strong>Difficulty:</strong> {gameSettings.difficulty} problems
                </div>
              </div>
            </div>

            <button
              onClick={startDuel}
              className="px-12 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 font-bold text-xl transition-all shadow-lg hover:scale-105"
            >
              ⚔️ START DUEL ⚔️
            </button>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 text-center">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">⚔️ How 1v1 Duels Work</h3>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div>
                <div className="text-3xl mb-2">🎯</div>
                <h4 className="font-bold text-gray-800 mb-2">Race to Victory</h4>
                <p className="text-gray-600 text-sm">
                  Both players solve the same integration problems simultaneously. 
                  First to reach the target score wins the duel!
                </p>
              </div>
              <div>
                <div className="text-3xl mb-2">⏱️</div>
                <h4 className="font-bold text-gray-800 mb-2">Time Pressure</h4>
                <p className="text-gray-600 text-sm">
                  Each question has a time limit. Quick thinking and accuracy 
                  are key to victory in these intense duels.
                </p>
              </div>
              <div>
                <div className="text-3xl mb-2">🏆</div>
                <h4 className="font-bold text-gray-800 mb-2">Winner Takes All</h4>
                <p className="text-gray-600 text-sm">
                  The first player to reach the target number of correct answers 
                  wins the duel and claims victory!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.push("/")}
            className="px-8 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 font-medium transition-all shadow-md"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}

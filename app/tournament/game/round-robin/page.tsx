"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import MathDisplay from "@/app/components/math-display"
import { IntegralProblem, getRandomProblem } from "@/lib/integral-database"

interface Player {
  id: string
  name: string
  score: number
  isHost: boolean
  answered: boolean
  correct: boolean
  timeToAnswer: number
}

interface GameSettings {
  questionsPerRound: number
  timePerQuestion: number
  totalRounds: number
  difficulty: "Basic" | "Intermediate" | "Advanced" | "Mixed"
}

export default function RoundRobinGamePage() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameData, setGameData] = useState<{
    players: Player[]
    settings: GameSettings
    gameCode: string
  } | null>(null)
  
  const [currentRound, setCurrentRound] = useState(1)
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [timeLeft, setTimeLeft] = useState(0)
  const [currentProblem, setCurrentProblem] = useState<IntegralProblem | null>(null)
  const [gamePhase, setGamePhase] = useState<"waiting" | "question" | "results" | "final">("waiting")
  const [isDrawing, setIsDrawing] = useState(false)
  const [allPaths, setAllPaths] = useState<any[]>([])
  const [currentPath, setCurrentPath] = useState<any>({ points: [], isEraser: false })
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  // Load game data from sessionStorage
  useEffect(() => {
    const tournamentType = sessionStorage.getItem('tournament-type')
    const gameCode = sessionStorage.getItem('game-code')
    const players = sessionStorage.getItem('players')
    const settings = sessionStorage.getItem('game-settings')

    if (tournamentType === 'round-robin' && gameCode && players && settings) {
      setGameData({
        gameCode,
        players: JSON.parse(players),
        settings: JSON.parse(settings)
      })
    } else {
      router.push('/tournament/round-robin')
    }
  }, [router])

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  // Start next question
  const startNextQuestion = () => {
    if (!gameData) return

    const difficulty = gameData.settings.difficulty === "Mixed" 
      ? ["Basic", "Intermediate", "Advanced"][Math.floor(Math.random() * 3)] as any
      : gameData.settings.difficulty

    const problem = getRandomProblem(difficulty)
    setCurrentProblem(problem)
    setTimeLeft(gameData.settings.timePerQuestion)
    setGamePhase("question")
    setHasSubmitted(false)
    clearCanvas()
  }

  // Timer logic
  useEffect(() => {
    if (gamePhase !== "question" || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setGamePhase("results")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gamePhase, timeLeft])

  // Drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setIsDrawing(true)
    setCurrentPath({ points: [{ x, y }], isEraser: false })
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setCurrentPath((prev: any) => ({
      ...prev,
      points: [...prev.points, { x, y }],
    }))

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.strokeStyle = "black"
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    const points = currentPath.points
    if (points.length < 2) return

    ctx.beginPath()
    ctx.moveTo(points[points.length - 2].x, points[points.length - 2].y)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const endDrawing = () => {
    setIsDrawing(false)
    setAllPaths((prev) => [...prev, currentPath])
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setAllPaths([])
  }

  // Submit answer
  const submitAnswer = async () => {
    if (!currentProblem || hasSubmitted) return

    const canvas = canvasRef.current
    if (!canvas) return

    setHasSubmitted(true)
    const timeToAnswer = gameData!.settings.timePerQuestion - timeLeft

    try {
      const ctx = canvas.getContext("2d")
      const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height)
      
      if (!imageData) {
        throw new Error("Could not get canvas data")
      }

      const base64Image = canvas.toDataURL("image/png")

      const response = await fetch("/api/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageData: base64Image,
          solution: currentProblem.solution,
          problem: currentProblem.problem,
          alternativeForms: currentProblem.alternativeForms || [],
        }),
      })

      const data = await response.json()
      const isCorrect = data.isCorrect

      // Calculate points based on speed and accuracy
      let points = 0
      if (isCorrect) {
        const speedBonus = Math.max(0, Math.floor((timeLeft / gameData!.settings.timePerQuestion) * 500))
        points = 1000 + speedBonus
      }

      // Update player score (simulated - in real app this would be server-side)
      setGameData(prev => {
        if (!prev) return prev
        const updatedPlayers = prev.players.map(player => {
          if (player.id === "host") { // Simplified - would use actual player ID
            return {
              ...player,
              score: player.score + points,
              answered: true,
              correct: isCorrect,
              timeToAnswer
            }
          }
          return player
        })
        return { ...prev, players: updatedPlayers }
      })

    } catch (error) {
      console.error("Error validating solution:", error)
      alert("Error submitting answer. Please try again.")
      setHasSubmitted(false)
    }
  }

  // Continue to next question/round
  const continueGame = () => {
    if (!gameData) return

    if (currentQuestion < gameData.settings.questionsPerRound) {
      setCurrentQuestion(prev => prev + 1)
      startNextQuestion()
    } else if (currentRound < gameData.settings.totalRounds) {
      setCurrentRound(prev => prev + 1)
      setCurrentQuestion(1)
      setShowLeaderboard(true)
      setTimeout(() => {
        setShowLeaderboard(false)
        startNextQuestion()
      }, 5000)
    } else {
      setGamePhase("final")
    }
  }

  // Format problem to LaTeX
  const formatProblemToLatex = (problem: string) => {
    return problem
      .replace(/∫/g, "\\int ")
      .replace(/dx/g, "\\,dx")
      .replace(/\^(\d+)/g, "^{$1}")
      .replace(/sqrt/g, "\\sqrt")
      .replace(/sin/g, "\\sin")
      .replace(/cos/g, "\\cos")
      .replace(/tan/g, "\\tan")
      .replace(/ln/g, "\\ln")
      .replace(/pi/g, "\\pi")
      .replace(/e\^/g, "e^")
  }

  if (!gameData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading tournament...</div>
      </div>
    )
  }

  // Final Results Screen
  if (gamePhase === "final") {
    const sortedPlayers = [...gameData.players].sort((a, b) => b.score - a.score)
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-8">🏆 Tournament Complete!</h1>
          
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Final Leaderboard</h2>
            
            <div className="space-y-4">
              {sortedPlayers.map((player, index) => (
                <div key={player.id} className={`
                  flex items-center justify-between p-6 rounded-lg
                  ${index === 0 ? "bg-yellow-100 border-2 border-yellow-400" :
                    index === 1 ? "bg-gray-100 border-2 border-gray-400" :
                    index === 2 ? "bg-orange-100 border-2 border-orange-400" :
                    "bg-gray-50"}
                `}>
                  <div className="flex items-center gap-4">
                    <div className={`
                      text-2xl font-bold w-12 h-12 rounded-full flex items-center justify-center
                      ${index === 0 ? "bg-yellow-500 text-white" :
                        index === 1 ? "bg-gray-500 text-white" :
                        index === 2 ? "bg-orange-500 text-white" :
                        "bg-blue-500 text-white"}
                    `}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-xl font-bold text-gray-800">{player.name}</div>
                      {index === 0 && <div className="text-yellow-600 font-medium">🏆 Champion!</div>}
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-800">
                    {player.score.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push("/tournament/round-robin")}
              className="px-8 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 font-medium transition-all shadow-md"
            >
              🔄 New Tournament
            </button>
            <button
              onClick={() => router.push("/tournament")}
              className="px-8 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 font-medium transition-all shadow-md"
            >
              🏠 Tournament Menu
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Leaderboard Screen
  if (showLeaderboard) {
    const sortedPlayers = [...gameData.players].sort((a, b) => b.score - a.score)
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl w-full">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
            📊 Round {currentRound - 1} Results
          </h2>
          
          <div className="space-y-3 mb-8">
            {sortedPlayers.map((player, index) => (
              <div key={player.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-800">{player.name}</span>
                </div>
                <span className="text-lg font-bold text-gray-800">{player.score.toLocaleString()}</span>
              </div>
            ))}
          </div>
          
          <div className="text-center text-gray-600">
            Next round starting soon...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-sm text-gray-600">Round {currentRound}/{gameData.settings.totalRounds}</div>
            <div className="text-lg font-bold text-gray-800">Question {currentQuestion}/{gameData.settings.questionsPerRound}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-sm text-gray-600">Game Code</div>
            <div className="text-lg font-bold text-purple-600 font-mono">{gameData.gameCode}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-sm text-gray-600">Time Left</div>
            <div className="text-2xl font-bold text-red-600">{timeLeft}s</div>
          </div>
        </div>

        {gamePhase === "waiting" && (
          <div className="text-center">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Get Ready!</h2>
              <p className="text-lg text-gray-600 mb-6">Tournament is about to begin</p>
              <button
                onClick={startNextQuestion}
                className="px-8 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-medium transition-all shadow-md"
              >
                🚀 Start Tournament
              </button>
            </div>
          </div>
        )}

        {gamePhase === "question" && currentProblem && (
          <div className="space-y-6">
            {/* Problem Display */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-center">
                <div className="text-3xl mb-4">
                  <MathDisplay
                    math={formatProblemToLatex(currentProblem.problem)}
                    className="flex justify-center items-center"
                  />
                </div>
                <div className="text-sm text-gray-600">
                  Difficulty: {currentProblem.difficulty}
                </div>
              </div>
            </div>

            {/* Drawing Canvas */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <canvas
                ref={canvasRef}
                width={800}
                height={300}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={endDrawing}
                onMouseLeave={endDrawing}
                className="border-2 border-gray-300 rounded-lg bg-white cursor-crosshair mx-auto block"
              />
              
              <div className="flex gap-4 justify-center mt-4">
                <button 
                  onClick={clearCanvas} 
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium transition-all shadow-md"
                >
                  🗑️ Clear
                </button>
                <button
                  onClick={submitAnswer}
                  disabled={hasSubmitted}
                  className={`
                    px-8 py-2 rounded-lg font-bold transition-all shadow-md
                    ${hasSubmitted 
                      ? "bg-gray-400 cursor-not-allowed text-white" 
                      : "bg-green-500 hover:bg-green-600 text-white hover:scale-105"
                    }
                  `}
                >
                  {hasSubmitted ? "✅ Submitted" : "🚀 Submit Answer"}
                </button>
              </div>
            </div>
          </div>
        )}

        {gamePhase === "results" && (
          <div className="text-center">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Question Complete!</h2>
              <p className="text-lg text-gray-600 mb-6">Moving to next question...</p>
              <button
                onClick={continueGame}
                className="px-8 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-medium transition-all shadow-md"
              >
                ➡️ Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

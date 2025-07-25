"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import MathDisplay from "@/app/components/math-display"
import { IntegralProblem, getRandomProblem } from "@/lib/integral-database"

interface GameSettings {
  questionsToWin: number
  timePerQuestion: number
  difficulty: "Basic" | "Intermediate" | "Advanced" | "Mixed"
}

interface DuelState {
  playerScore: number
  opponentScore: number
  currentQuestion: number
  gamePhase: "countdown" | "question" | "result" | "final"
}

export default function OneVOneGamePage() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameData, setGameData] = useState<{
    playerName: string
    opponent: string
    gameCode: string
    isHost: boolean
    settings: GameSettings
  } | null>(null)
  
  const [duelState, setDuelState] = useState<DuelState>({
    playerScore: 0,
    opponentScore: 0,
    currentQuestion: 1,
    gamePhase: "countdown"
  })
  
  const [timeLeft, setTimeLeft] = useState(0)
  const [countdownTimer, setCountdownTimer] = useState(3)
  const [currentProblem, setCurrentProblem] = useState<IntegralProblem | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [allPaths, setAllPaths] = useState<any[]>([])
  const [currentPath, setCurrentPath] = useState<any>({ points: [], isEraser: false })
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [lastResult, setLastResult] = useState<{correct: boolean, feedback?: string} | null>(null)

  // Load game data from sessionStorage
  useEffect(() => {
    const duelType = sessionStorage.getItem('duel-type')
    const gameCode = sessionStorage.getItem('game-code')
    const playerName = sessionStorage.getItem('player-name')
    const isHost = sessionStorage.getItem('is-host') === 'true'
    const opponent = sessionStorage.getItem('opponent')
    const settings = sessionStorage.getItem('game-settings')

    if (duelType === '1v1' && gameCode && playerName && opponent && settings) {
      setGameData({
        gameCode,
        playerName,
        opponent,
        isHost,
        settings: JSON.parse(settings)
      })
    } else {
      router.push('/1v1')
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

  // Countdown timer
  useEffect(() => {
    if (duelState.gamePhase === "countdown" && countdownTimer > 0) {
      const timer = setTimeout(() => {
        if (countdownTimer === 1) {
          startNextQuestion()
        } else {
          setCountdownTimer(prev => prev - 1)
        }
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [duelState.gamePhase, countdownTimer])

  // Question timer
  useEffect(() => {
    if (duelState.gamePhase !== "question" || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [duelState.gamePhase, timeLeft])

  // Start next question
  const startNextQuestion = () => {
    if (!gameData) return

    const difficulty = gameData.settings.difficulty === "Mixed" 
      ? ["Basic", "Intermediate", "Advanced"][Math.floor(Math.random() * 3)] as any
      : gameData.settings.difficulty

    const problem = getRandomProblem(difficulty)
    setCurrentProblem(problem)
    setTimeLeft(gameData.settings.timePerQuestion)
    setDuelState(prev => ({ ...prev, gamePhase: "question" }))
    setHasSubmitted(false)
    setLastResult(null)
    clearCanvas()
  }

  // Handle time up
  const handleTimeUp = () => {
    setDuelState(prev => ({ ...prev, gamePhase: "result" }))
    setLastResult({ correct: false, feedback: "Time's up!" })
    
    // Simulate opponent potentially getting it right (random)
    if (Math.random() > 0.6) {
      setDuelState(prev => ({ ...prev, opponentScore: prev.opponentScore + 1 }))
    }
    
    setTimeout(() => {
      continueToNextQuestion()
    }, 3000)
  }

  // Continue to next question or end game
  const continueToNextQuestion = () => {
    if (!gameData) return

    // Check win condition
    if (duelState.playerScore >= gameData.settings.questionsToWin) {
      setDuelState(prev => ({ ...prev, gamePhase: "final" }))
      return
    }
    
    if (duelState.opponentScore >= gameData.settings.questionsToWin) {
      setDuelState(prev => ({ ...prev, gamePhase: "final" }))
      return
    }

    // Continue to next question
    setDuelState(prev => ({ ...prev, currentQuestion: prev.currentQuestion + 1 }))
    setCountdownTimer(3)
    setDuelState(prev => ({ ...prev, gamePhase: "countdown" }))
  }

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

      setLastResult({ correct: isCorrect, feedback: data.feedback })
      setDuelState(prev => ({ ...prev, gamePhase: "result" }))

      if (isCorrect) {
        setDuelState(prev => ({ ...prev, playerScore: prev.playerScore + 1 }))
      }

      // Simulate opponent answer (random with slight delay)
      setTimeout(() => {
        if (Math.random() > 0.5) {
          setDuelState(prev => ({ ...prev, opponentScore: prev.opponentScore + 1 }))
        }
      }, Math.random() * 2000 + 500)

      // Auto-continue after showing result
      setTimeout(() => {
        continueToNextQuestion()
      }, 3000)

    } catch (error) {
      console.error("Error validating solution:", error)
      setLastResult({ correct: false, feedback: "Error validating answer" })
      setHasSubmitted(false)
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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading duel...</div>
      </div>
    )
  }

  // Final Results Screen
  if (duelState.gamePhase === "final") {
    const playerWon = duelState.playerScore >= gameData.settings.questionsToWin
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 p-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-8xl mb-4">
            {playerWon ? "🏆" : "💪"}
          </div>
          
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            {playerWon ? "Victory!" : "Defeat!"}
          </h1>
          
          <h2 className="text-3xl font-bold mb-8 text-gray-600">
            {playerWon ? `${gameData.playerName} Wins!` : `${gameData.opponent} Wins!`}
          </h2>
          
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Final Score</h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className={`p-6 rounded-lg ${playerWon ? "bg-green-100" : "bg-red-100"}`}>
                <div className="text-4xl mb-2">👤</div>
                <h4 className="text-xl font-bold text-gray-800">{gameData.playerName}</h4>
                <div className="text-3xl font-bold text-gray-800">{duelState.playerScore}</div>
                {playerWon && <div className="text-green-600 font-bold">🏆 Winner!</div>}
              </div>
              
              <div className={`p-6 rounded-lg ${!playerWon ? "bg-green-100" : "bg-red-100"}`}>
                <div className="text-4xl mb-2">⚔️</div>
                <h4 className="text-xl font-bold text-gray-800">{gameData.opponent}</h4>
                <div className="text-3xl font-bold text-gray-800">{duelState.opponentScore}</div>
                {!playerWon && <div className="text-green-600 font-bold">🏆 Winner!</div>}
              </div>
            </div>
            
            <div className="mt-6 text-gray-600">
              Duel completed in {duelState.currentQuestion - 1} questions
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push("/1v1")}
              className="px-8 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 font-medium transition-all shadow-md"
            >
              🔄 New Duel
            </button>
            <button
              onClick={() => router.push("/")}
              className="px-8 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 font-medium transition-all shadow-md"
            >
              🏠 Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header - Score Display */}
        <div className="flex justify-between items-center mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 flex-1 mr-4">
            <div className="text-center">
              <div className="text-sm text-gray-600">👤 {gameData.playerName}</div>
              <div className="text-3xl font-bold text-blue-600">{duelState.playerScore}</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-center">
              <div className="text-sm text-gray-600">Question {duelState.currentQuestion}</div>
              <div className="text-lg font-bold text-gray-800">First to {gameData.settings.questionsToWin}</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4 flex-1 ml-4">
            <div className="text-center">
              <div className="text-sm text-gray-600">⚔️ {gameData.opponent}</div>
              <div className="text-3xl font-bold text-red-600">{duelState.opponentScore}</div>
            </div>
          </div>
        </div>

        {/* Timer Display */}
        <div className="text-center mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 inline-block">
            <div className="text-sm text-gray-600">Time Remaining</div>
            <div className={`text-3xl font-bold ${timeLeft <= 10 ? "text-red-600" : "text-green-600"}`}>
              {duelState.gamePhase === "question" ? timeLeft : "⏸️"}s
            </div>
          </div>
        </div>

        {/* Countdown Phase */}
        {duelState.gamePhase === "countdown" && (
          <div className="text-center">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Get Ready!</h2>
              <div className="text-8xl font-bold text-orange-500 mb-4">{countdownTimer}</div>
              <p className="text-lg text-gray-600">Next question starting...</p>
            </div>
          </div>
        )}

        {/* Question Phase */}
        {duelState.gamePhase === "question" && currentProblem && (
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

        {/* Result Phase */}
        {duelState.gamePhase === "result" && lastResult && (
          <div className="text-center">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className={`text-6xl mb-4 ${lastResult.correct ? "text-green-500" : "text-red-500"}`}>
                {lastResult.correct ? "✅" : "❌"}
              </div>
              <h2 className={`text-3xl font-bold mb-4 ${lastResult.correct ? "text-green-600" : "text-red-600"}`}>
                {lastResult.correct ? "Correct!" : "Incorrect!"}
              </h2>
              {lastResult.feedback && (
                <p className="text-lg text-gray-600 mb-4">{lastResult.feedback}</p>
              )}
              <p className="text-gray-600">Next question loading...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

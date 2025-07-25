"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import MathDisplay from "@/app/components/math-display"
import { IntegralProblem, getRandomProblem } from "@/lib/integral-database"

type Difficulty = "Basic" | "Intermediate" | "Advanced"
type Point = { x: number; y: number }
type DrawingPath = { points: Point[]; isEraser: boolean }

interface GamePageProps {
  params: Promise<{ mode: string }>
}

export default function GamePage({ params }: GamePageProps) {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isEraser, setIsEraser] = useState(false)
  const [currentPath, setCurrentPath] = useState<DrawingPath>({ points: [], isEraser: false })
  const [allPaths, setAllPaths] = useState<DrawingPath[]>([])
  const [points, setPoints] = useState(0)
  const [timeLeft, setTimeLeft] = useState(Number.POSITIVE_INFINITY)
  const [currentProblem, setCurrentProblem] = useState<IntegralProblem | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [streak, setStreak] = useState(0)
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty>("Basic")
  const [mode, setMode] = useState<string>("")
  const [gameCompleted, setGameCompleted] = useState(false)
  const [gameResults, setGameResults] = useState({
    totalProblems: 0,
    correctProblems: 0,
    incorrectProblems: 0,
    maxStreak: 0,
    finalStreak: 0,
    timeSpent: 0,
    difficultyReached: "Basic" as Difficulty,
    endReason: "time" as "time" | "completion" | "manual"
  })

  // Resolve params and initialize mode
  useEffect(() => {
    params.then(resolved => {
      const gameMode = resolved.mode
      setMode(gameMode)
      const initialTime = gameMode === "3min" ? 180 : gameMode === "5min" ? 300 : Number.POSITIVE_INFINITY
      setTimeLeft(initialTime)
      setGameResults(prev => ({ ...prev, timeSpent: initialTime }))
    })
  }, [params])

  // Initialize canvas with white background
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  // Initialize first problem
  useEffect(() => {
    const problem = getRandomProblem("Basic")
    setCurrentProblem(problem)
  }, [])

  // Get random problem based on difficulty
  const getNextProblem = (difficulty: Difficulty) => {
    const problem = getRandomProblem(difficulty)
    setCurrentProblem(problem)
    setShowHint(false)
  }

  // Timer logic
  useEffect(() => {
    if (mode === "unlimited" || gameCompleted) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          // End game and show results
          const finalResults = {
            totalProblems: gameResults.totalProblems,
            correctProblems: points,
            incorrectProblems: gameResults.totalProblems - points,
            maxStreak: Math.max(gameResults.maxStreak, streak),
            finalStreak: streak,
            timeSpent: mode === "3min" ? 180 : 300,
            difficultyReached: currentDifficulty,
            endReason: "time" as const
          }
          setGameResults(finalResults)
          setGameCompleted(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [mode, gameCompleted, gameResults.totalProblems, points, streak, currentDifficulty])

  // Drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setIsDrawing(true)
    setCurrentPath({ points: [{ x, y }], isEraser })
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setCurrentPath((prev) => ({
      ...prev,
      points: [...prev.points, { x, y }],
    }))

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.strokeStyle = isEraser ? "white" : "black"
    ctx.lineWidth = isEraser ? 20 : 2
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

  // Clear canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setAllPaths([])
  }

  // Check if canvas has drawing
  const hasDrawing = (imageData: ImageData) => {
    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] !== 255 || data[i + 1] !== 255 || data[i + 2] !== 255) {
        return true
      }
    }
    return false
  }

  // Validate solution
  const validateSolution = async () => {
    const canvas = canvasRef.current
    if (!canvas || !currentProblem) return

    setIsValidating(true)
    try {
      const ctx = canvas.getContext("2d")
      const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height)
      if (!imageData || !hasDrawing(imageData)) {
        alert("Please write your solution before submitting.")
        setIsValidating(false)
        return
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

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      if (data.error) {
        throw new Error(data.error)
      }

      if (data.isCorrect) {
        const newPoints = points + 1
        const newStreak = streak + 1
        const newMaxStreak = Math.max(gameResults.maxStreak, newStreak)
        const newTotalProblems = gameResults.totalProblems + 1
        
        setPoints(newPoints)
        setStreak(newStreak)
        setGameResults(prev => ({
          ...prev,
          totalProblems: newTotalProblems,
          maxStreak: newMaxStreak
        }))

        // Progression logic
        if (newPoints >= 3 && currentDifficulty === "Basic") {
          setCurrentDifficulty("Intermediate")
          getNextProblem("Intermediate")
        } else if (newPoints >= 8 && currentDifficulty === "Intermediate") {
          setCurrentDifficulty("Advanced")
          getNextProblem("Advanced")
        } else if (newPoints >= 15) {
          // Game completed successfully
          const finalResults = {
            totalProblems: newTotalProblems,
            correctProblems: newPoints,
            incorrectProblems: newTotalProblems - newPoints,
            maxStreak: newMaxStreak,
            finalStreak: newStreak,
            timeSpent: mode === "3min" ? 180 - timeLeft : mode === "5min" ? 300 - timeLeft : 0,
            difficultyReached: "Advanced" as Difficulty,
            endReason: "completion" as const
          }
          setGameResults(finalResults)
          setGameCompleted(true)
          return
        } else {
          getNextProblem(currentDifficulty)
        }

        if (newStreak > 1) {
          alert(`Correct! Streak: ${newStreak} 🔥`)
        } else {
          alert("Correct! Well done! ✅")
        }
      } else {
        setStreak(0)
        setGameResults(prev => ({
          ...prev,
          totalProblems: prev.totalProblems + 1
        }))
        const hintText = showHint ? currentProblem.hint || "No hint available" : "Click 'Show Hint' for help"
        alert(`${data.feedback || "Incorrect solution. Try again!"}\n\nHint: ${hintText}`)
      }
    } catch (error) {
      console.error("Error validating solution:", error)
      alert(`Error validating solution: ${error instanceof Error ? error.message : "Unknown error occurred"}`)
    } finally {
      setIsValidating(false)
      clearCanvas()
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

  // Handle manual game end
  const endGameManually = () => {
    const finalResults = {
      totalProblems: gameResults.totalProblems,
      correctProblems: points,
      incorrectProblems: gameResults.totalProblems - points,
      maxStreak: Math.max(gameResults.maxStreak, streak),
      finalStreak: streak,
      timeSpent: mode === "3min" ? 180 - timeLeft : mode === "5min" ? 300 - timeLeft : 0,
      difficultyReached: currentDifficulty,
      endReason: "manual" as const
    }
    setGameResults(finalResults)
    setGameCompleted(true)
  }

  // Calculate accuracy percentage
  const getAccuracy = () => {
    if (gameResults.totalProblems === 0) return 0
    return Math.round((gameResults.correctProblems / gameResults.totalProblems) * 100)
  }

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Get performance rating
  const getPerformanceRating = () => {
    const accuracy = getAccuracy()
    const streak = gameResults.maxStreak
    
    if (accuracy >= 90 && streak >= 10) return { rating: "🏆 Excellent", color: "text-yellow-600" }
    if (accuracy >= 75 && streak >= 7) return { rating: "⭐ Great", color: "text-green-600" }
    if (accuracy >= 60 && streak >= 5) return { rating: "👍 Good", color: "text-blue-600" }
    if (accuracy >= 40) return { rating: "📈 Improving", color: "text-orange-600" }
    return { rating: "💪 Keep Practicing", color: "text-red-600" }
  }

  // Results Screen Component
  if (gameCompleted) {
    const performance = getPerformanceRating()
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">🐝 Integration Rush Complete!</h1>
            <p className="text-lg text-gray-600">Here are your results</p>
          </div>

          {/* Performance Rating */}
          <div className="text-center mb-8">
            <div className={`text-2xl font-bold ${performance.color} mb-2`}>
              {performance.rating}
            </div>
            <div className="text-lg text-gray-600">
              Accuracy: {getAccuracy()}% • Max Streak: {gameResults.maxStreak}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{gameResults.correctProblems}</div>
              <div className="text-sm text-gray-600">Correct</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{gameResults.incorrectProblems}</div>
              <div className="text-sm text-gray-600">Incorrect</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{gameResults.totalProblems}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{gameResults.maxStreak}</div>
              <div className="text-sm text-gray-600">Best Streak</div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">Game Mode:</span>
              <span className="text-gray-900 capitalize">{mode} {mode !== "unlimited" ? "Challenge" : "Mode"}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">Difficulty Reached:</span>
              <span className="text-gray-900">{gameResults.difficultyReached}</span>
            </div>
            {mode !== "unlimited" && (
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">Time Spent:</span>
                <span className="text-gray-900">{formatTime(gameResults.timeSpent)}</span>
              </div>
            )}
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">Final Streak:</span>
              <span className="text-gray-900">{gameResults.finalStreak}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">End Reason:</span>
              <span className="text-gray-900">
                {gameResults.endReason === "time" ? "⏰ Time Up" : 
                 gameResults.endReason === "completion" ? "🎉 Completed" : 
                 "🚪 Manually Ended"}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 flex-wrap justify-center">
            <button
              onClick={() => {
                setGameCompleted(false)
                setPoints(0)
                setStreak(0)
                setCurrentDifficulty("Basic")
                setGameResults({
                  totalProblems: 0,
                  correctProblems: 0,
                  incorrectProblems: 0,
                  maxStreak: 0,
                  finalStreak: 0,
                  timeSpent: 0,
                  difficultyReached: "Basic",
                  endReason: "time"
                })
                setTimeLeft(mode === "3min" ? 180 : mode === "5min" ? 300 : Number.POSITIVE_INFINITY)
                getNextProblem("Basic")
                clearCanvas()
              }}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-all shadow-md"
            >
              🔄 Play Again
            </button>
            <button
              onClick={() => router.push("/rush")}
              className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-medium transition-all shadow-md"
            >
              🎮 Change Mode
            </button>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium transition-all shadow-md"
            >
              🏠 Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Header with Points and Timer */}
      <div className="fixed top-4 right-4 bg-white rounded-lg shadow-md p-4 z-10">
        <div className="text-xl font-bold mb-2 text-gray-800">Points: {points}</div>
        {mode !== "unlimited" && (
          <div className="text-lg text-blue-600 font-medium">
            Time: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
          </div>
        )}
        {streak > 0 && (
          <div className="text-sm text-orange-600 font-medium">
            🔥 Streak: {streak}
          </div>
        )}
      </div>

      {/* Problem Display with LaTeX */}
      <div className="text-center mb-8 mt-4">
        {/* Problem Statement */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-4 min-h-[100px] flex items-center justify-center">
          <div className="text-3xl leading-normal">
            {currentProblem ? (
              <MathDisplay
                math={formatProblemToLatex(currentProblem.problem)}
                className="flex justify-center items-center"
              />
            ) : (
              <div className="text-gray-500">Loading problem...</div>
            )}
          </div>
        </div>
        
        {/* Problem Info */}
        <div className="flex justify-center gap-4 text-sm flex-wrap">
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
            Difficulty: {currentProblem?.difficulty || "Loading..."}
          </div>
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
            Points: {points}
          </div>
          <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full">
            Streak: {streak}
          </div>
          <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
            Mode: {mode || "Loading..."}
          </div>
        </div>
      </div>

      {/* Drawing Canvas */}
      <div className="flex flex-col items-center gap-6">
        {/* Canvas Container */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <canvas
            ref={canvasRef}
            width={800}
            height={400}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={endDrawing}
            onMouseLeave={endDrawing}
            className="border-2 border-gray-300 rounded-lg bg-white cursor-crosshair"
          />
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex gap-3 flex-wrap justify-center">
            <button
              onClick={() => setIsEraser(false)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                !isEraser 
                  ? "bg-blue-500 text-white shadow-md" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              ✏️ Pen
            </button>
            <button
              onClick={() => setIsEraser(true)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                isEraser 
                  ? "bg-blue-500 text-white shadow-md" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              🧹 Eraser
            </button>
            <button 
              onClick={clearCanvas} 
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium transition-all shadow-md"
            >
              🗑️ Clear
            </button>
            <button
              onClick={() => setShowHint(!showHint)}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-medium transition-all shadow-md"
            >
              💡 {showHint ? "Hide Hint" : "Show Hint"}
            </button>
            <button
              onClick={() => getNextProblem(currentDifficulty)}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-medium transition-all shadow-md"
            >
              ⏭️ Skip
            </button>
            <button
              onClick={endGameManually}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium transition-all shadow-md"
            >
              🏁 End Game
            </button>
            <button
              onClick={validateSolution}
              disabled={isValidating}
              className={`px-8 py-2 rounded-lg font-bold text-lg transition-all shadow-md ${
                isValidating 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-green-500 hover:bg-green-600 text-white hover:scale-105"
              }`}
            >
              {isValidating ? "🔄 Validating..." : "✅ Submit Solution"}
            </button>
          </div>
        </div>

        {/* Hint Display */}
        {showHint && currentProblem?.hint && (
          <div className="mt-2 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg max-w-2xl mx-auto shadow-md">
            <h4 className="font-bold text-yellow-800 mb-3 text-lg">💡 Hint:</h4>
            <p className="text-yellow-800 leading-relaxed">{currentProblem.hint}</p>
          </div>
        )}
      </div>

      {/* Back Button */}
      <button
        onClick={() => router.push("/rush")}
        className="fixed bottom-4 left-4 bg-white text-gray-700 px-4 py-2 rounded-lg shadow-md hover:bg-gray-50 transition-all font-medium"
      >
        ← Back to Mode Selection
      </button>
    </div>
  )
}

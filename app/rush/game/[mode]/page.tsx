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

  // Resolve params and initialize mode
  useEffect(() => {
    params.then(resolved => {
      const gameMode = resolved.mode
      setMode(gameMode)
      setTimeLeft(
        gameMode === "3min" ? 180 : gameMode === "5min" ? 300 : Number.POSITIVE_INFINITY
      )
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
    if (mode === "unlimited") return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push("/rush")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [mode, router])

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
        setPoints(newPoints)
        setStreak(newStreak)

        // Progression logic
        if (newPoints >= 3 && currentDifficulty === "Basic") {
          setCurrentDifficulty("Intermediate")
          getNextProblem("Intermediate")
        } else if (newPoints >= 8 && currentDifficulty === "Intermediate") {
          setCurrentDifficulty("Advanced")
          getNextProblem("Advanced")
        } else if (newPoints >= 15) {
          alert(`Congratulations! You've completed ${newPoints} problems! Final streak: ${newStreak}`)
          router.push("/rush")
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

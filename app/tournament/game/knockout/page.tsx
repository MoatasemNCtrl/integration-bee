"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import MathDisplay from "@/app/components/math-display"
import { IntegralProblem, getRandomProblem } from "@/lib/integral-database"

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
  score1: number
  score2: number
}

interface GameSettings {
  questionsPerMatch: number
  timePerQuestion: number
  difficulty: "Basic" | "Intermediate" | "Advanced" | "Mixed"
  tournamentSize: number
}

export default function KnockoutGamePage() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameData, setGameData] = useState<{
    players: Player[]
    settings: GameSettings
    gameCode: string
    bracket: Match[]
  } | null>(null)
  
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [timeLeft, setTimeLeft] = useState(0)
  const [currentProblem, setCurrentProblem] = useState<IntegralProblem | null>(null)
  const [gamePhase, setGamePhase] = useState<"bracket" | "question" | "match-results" | "final">("bracket")
  const [isDrawing, setIsDrawing] = useState(false)
  const [allPaths, setAllPaths] = useState<any[]>([])
  const [currentPath, setCurrentPath] = useState<any>({ points: [], isEraser: false })
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [player1Score, setPlayer1Score] = useState(0)
  const [player2Score, setPlayer2Score] = useState(0)

  // Load game data from sessionStorage
  useEffect(() => {
    const tournamentType = sessionStorage.getItem('tournament-type')
    const gameCode = sessionStorage.getItem('game-code')
    const players = sessionStorage.getItem('players')
    const settings = sessionStorage.getItem('game-settings')
    const bracket = sessionStorage.getItem('bracket')

    if (tournamentType === 'knockout' && gameCode && players && settings && bracket) {
      const gameData = {
        gameCode,
        players: JSON.parse(players),
        settings: JSON.parse(settings),
        bracket: JSON.parse(bracket)
      }
      setGameData(gameData)
      setCurrentMatch(gameData.bracket[0])
    } else {
      router.push('/tournament/knockout')
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
    if (!gameData || !currentMatch) return

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
          checkMatchComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gamePhase, timeLeft])

  // Check if match is complete
  const checkMatchComplete = () => {
    if (!gameData || !currentMatch) return

    if (currentQuestion >= gameData.settings.questionsPerMatch) {
      const winner = player1Score > player2Score ? currentMatch.player1 : 
                    player2Score > player1Score ? currentMatch.player2 : null

      if (winner) {
        setCurrentMatch(prev => prev ? { ...prev, winner, score1: player1Score, score2: player2Score } : null)
        setGamePhase("match-results")
      } else {
        // Tie - continue with sudden death
        setCurrentQuestion(prev => prev + 1)
        startNextQuestion()
      }
    } else {
      setCurrentQuestion(prev => prev + 1)
      startNextQuestion()
    }
  }

  // Continue to next match or end tournament
  const continueToNextMatch = () => {
    if (!gameData || !currentMatch) return

    // Update bracket with winner
    const updatedBracket = gameData.bracket.map(match => 
      match.id === currentMatch.id ? currentMatch : match
    )

    // Check if this was the final match
    const remainingMatches = updatedBracket.filter(match => !match.winner)
    
    if (remainingMatches.length === 0) {
      // Tournament complete
      setGamePhase("final")
    } else {
      // Move to next match
      const nextMatch = remainingMatches[0]
      setCurrentMatch(nextMatch)
      setCurrentQuestion(1)
      setPlayer1Score(0)
      setPlayer2Score(0)
      setGamePhase("question")
      startNextQuestion()
    }
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
    if (!currentProblem || hasSubmitted || !currentMatch) return

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

      // Award point if correct (simplified - in real game both players would answer)
      if (isCorrect) {
        // For demo, randomly assign to player 1 or 2
        if (Math.random() > 0.5) {
          setPlayer1Score(prev => prev + 1)
        } else {
          setPlayer2Score(prev => prev + 1)
        }
      }

      // Auto-continue after a short delay
      setTimeout(() => {
        checkMatchComplete()
      }, 2000)

    } catch (error) {
      console.error("Error validating solution:", error)
      alert("Error submitting answer. Please try again.")
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

  // Generate tournament bracket display
  const generateBracketDisplay = () => {
    if (!gameData) return null

    const rounds = Math.ceil(Math.log2(gameData.players.length))
    const roundsData: Match[][] = []
    
    for (let r = 1; r <= rounds; r++) {
      roundsData.push(gameData.bracket.filter(match => match.round === r))
    }

    return (
      <div className="space-y-8">
        {roundsData.map((roundMatches, roundIndex) => (
          <div key={roundIndex} className="text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {roundIndex === rounds - 1 ? "Final" : `Round ${roundIndex + 1}`}
            </h3>
            <div className="grid gap-4" style={{gridTemplateColumns: `repeat(${Math.max(1, Math.ceil(roundMatches.length / 2))}, 1fr)`}}>
              {roundMatches.map((match) => (
                <div key={match.id} className={`
                  border-2 rounded-lg p-4
                  ${match === currentMatch ? "border-red-500 bg-red-50" : 
                    match.winner ? "border-green-500 bg-green-50" : "border-gray-300 bg-white"}
                `}>
                  <div className="space-y-2">
                    <div className={`flex justify-between items-center p-2 rounded ${
                      match.winner === match.player1 ? "bg-green-200" : "bg-gray-100"
                    }`}>
                      <span className="font-medium">{match.player1.name}</span>
                      <span className="font-bold">{match.score1 || 0}</span>
                    </div>
                    <div className="text-xs text-gray-500">VS</div>
                    <div className={`flex justify-between items-center p-2 rounded ${
                      match.winner === match.player2 ? "bg-green-200" : "bg-gray-100"
                    }`}>
                      <span className="font-medium">{match.player2.name}</span>
                      <span className="font-bold">{match.score2 || 0}</span>
                    </div>
                  </div>
                  {match.winner && (
                    <div className="mt-2 text-green-600 font-bold text-sm">
                      🏆 {match.winner.name} wins!
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!gameData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading tournament...</div>
      </div>
    )
  }

  // Final Results Screen
  if (gamePhase === "final") {
    const champion = gameData.bracket.find(match => match.round === Math.ceil(Math.log2(gameData.players.length)))?.winner
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 p-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-8">⚔️ Tournament Complete!</h1>
          
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-4xl font-bold text-yellow-600 mb-2">Champion</h2>
            <h3 className="text-3xl font-bold text-gray-800 mb-8">{champion?.name}</h3>
            
            <div className="text-center mb-8">
              <h4 className="text-2xl font-bold text-gray-800 mb-4">Tournament Bracket</h4>
              {generateBracketDisplay()}
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push("/tournament/knockout")}
              className="px-8 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 font-medium transition-all shadow-md"
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

  // Bracket Overview Screen
  if (gamePhase === "bracket") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 p-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">⚔️ Tournament Bracket</h1>
          
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            {generateBracketDisplay()}
          </div>

          <div className="text-center">
            <button
              onClick={() => {
                setGamePhase("question")
                startNextQuestion()
              }}
              className="px-12 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 font-bold text-lg transition-all shadow-md"
            >
              🚀 Start Tournament
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Match Results Screen
  if (gamePhase === "match-results" && currentMatch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 p-4 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl w-full text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Match Complete!</h2>
          
          <div className="space-y-4 mb-8">
            <div className={`p-4 rounded-lg ${currentMatch.winner === currentMatch.player1 ? "bg-green-100" : "bg-gray-100"}`}>
              <div className="text-xl font-bold">{currentMatch.player1.name}</div>
              <div className="text-2xl font-bold">{player1Score}</div>
              {currentMatch.winner === currentMatch.player1 && <div className="text-green-600">🏆 Winner!</div>}
            </div>
            
            <div className="text-lg font-bold text-gray-600">VS</div>
            
            <div className={`p-4 rounded-lg ${currentMatch.winner === currentMatch.player2 ? "bg-green-100" : "bg-gray-100"}`}>
              <div className="text-xl font-bold">{currentMatch.player2.name}</div>
              <div className="text-2xl font-bold">{player2Score}</div>
              {currentMatch.winner === currentMatch.player2 && <div className="text-green-600">🏆 Winner!</div>}
            </div>
          </div>

          <button
            onClick={continueToNextMatch}
            className="px-8 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 font-medium transition-all shadow-md"
          >
            ➡️ Continue Tournament
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-sm text-gray-600">Current Match</div>
            <div className="text-lg font-bold text-gray-800">
              {currentMatch?.player1.name} vs {currentMatch?.player2.name}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-sm text-gray-600">Question</div>
            <div className="text-lg font-bold text-gray-800">{currentQuestion}/{gameData.settings.questionsPerMatch}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-sm text-gray-600">Score</div>
            <div className="text-lg font-bold text-gray-800">{player1Score} - {player2Score}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-sm text-gray-600">Time Left</div>
            <div className="text-2xl font-bold text-red-600">{timeLeft}s</div>
          </div>
        </div>

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
      </div>
    </div>
  )
}

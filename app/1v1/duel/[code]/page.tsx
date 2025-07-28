"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import MathDisplay from "@/app/components/math-display"
import { Loader2, Clock, Trophy, Target, User, Users, Crown, Zap } from "lucide-react"
import { IntegralProblem, getRandomProblem } from "@/lib/integral-database"

interface DuelGameState {
  id: string
  code: string
  status: "WAITING" | "IN_PROGRESS" | "COMPLETED" | "ABANDONED"
  timeControl: number
  difficulty: string
  questionsToWin: number
  
  host: { id: string; name: string; image?: string }
  opponent?: { id: string; name: string; image?: string }
  winner?: { id: string; name: string; image?: string }
  
  hostScore: number
  opponentScore: number
  hostTimeRemaining: number
  opponentTimeRemaining: number
  
  currentQuestionId?: string
  currentProblem?: IntegralProblem
  gamePhase: "waiting" | "countdown" | "playing" | "result" | "finished"
  
  createdAt: string
  startedAt?: string
  completedAt?: string
}

export default function DuelGamePage({ params }: { params: { code: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [gameState, setGameState] = useState<DuelGameState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [countdown, setCountdown] = useState(0)
  const [answer, setAnswer] = useState("")
  const [lastResult, setLastResult] = useState<{ correct: boolean; feedback?: string } | null>(null)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  
  // Drawing canvas state
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [allPaths, setAllPaths] = useState<{ points: { x: number; y: number }[]; isEraser: boolean }[]>([])
  const [currentPath, setCurrentPath] = useState<{ points: { x: number; y: number }[]; isEraser: boolean }>({ points: [], isEraser: false })
  
  const role = searchParams.get('role') as 'host' | 'opponent'
  const isHost = role === 'host'
  const playerId = session?.user?.id
  const isMyTurn = gameState?.currentQuestionId ? true : false // For now, both players see same question
  
  // Polling interval for real-time updates
  useEffect(() => {
    if (!session?.user) {
      router.push('/auth/signin')
      return
    }
    
    loadGameState()
    
    // Poll for updates every 2 seconds
    const interval = setInterval(loadGameState, 2000)
    
    return () => clearInterval(interval)
  }, [params.code, session])
  
  // Countdown timer effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0 && gameState?.gamePhase === "countdown") {
      // Start the game
      startNextQuestion()
    }
  }, [countdown, gameState?.gamePhase])
  
  // Game timer effect
  useEffect(() => {
    if (gameState?.status === "IN_PROGRESS" && gameState.gamePhase === "playing") {
      const timer = setInterval(() => {
        updateGameTimer()
      }, 1000)
      
      return () => clearInterval(timer)
    }
  }, [gameState?.status, gameState?.gamePhase])
  
  const loadGameState = async () => {
    try {
      const response = await fetch(`/api/duel/game/${params.code}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load game')
      }
      
      setGameState(data.gameState)
      
      // Initialize countdown if game just started
      if (data.gameState.status === "IN_PROGRESS" && data.gameState.gamePhase === "countdown" && countdown === 0) {
        setCountdown(3)
      }
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load game')
    } finally {
      setLoading(false)
    }
  }
  
  const updateGameTimer = async () => {
    try {
      await fetch(`/api/duel/game/${params.code}/timer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId })
      })
    } catch (error) {
      console.error('Failed to update timer:', error)
    }
  }
  
  const startNextQuestion = async () => {
    try {
      const response = await fetch(`/api/duel/game/${params.code}/question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId })
      })
      
      const data = await response.json()
      if (response.ok) {
        setGameState(prev => prev ? { ...prev, ...data.gameState } : null)
        setHasSubmitted(false)
        setLastResult(null)
        setAnswer("")
        clearCanvas()
      }
    } catch (error) {
      console.error('Failed to start question:', error)
    }
  }
  
  const submitAnswer = async () => {
    if (!answer.trim() || hasSubmitted) return
    
    setHasSubmitted(true)
    
    try {
      const response = await fetch(`/api/duel/game/${params.code}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          playerId,
          answer: answer.trim()
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setLastResult(data.result)
        setGameState(prev => prev ? { ...prev, ...data.gameState } : null)
        
        // Auto-start next question after 3 seconds
        setTimeout(() => {
          if (data.gameState.gamePhase !== "finished") {
            startNextQuestion()
          }
        }, 3000)
      }
    } catch (error) {
      console.error('Failed to submit answer:', error)
      setHasSubmitted(false)
    }
  }
  
  // Canvas drawing functions
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
    if (!isDrawing || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    if (ctx) {
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      
      ctx.beginPath()
      const lastPoint = currentPath.points[currentPath.points.length - 1]
      ctx.moveTo(lastPoint.x, lastPoint.y)
      ctx.lineTo(x, y)
      ctx.stroke()
    }
    
    setCurrentPath((prev: { points: { x: number; y: number }[]; isEraser: boolean }) => ({
      ...prev,
      points: [...prev.points, { x, y }]
    }))
  }
  
  const stopDrawing = () => {
    if (isDrawing) {
      setAllPaths(prev => [...prev, currentPath])
      setCurrentPath({ points: [], isEraser: false })
      setIsDrawing(false)
    }
  }
  
  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx?.clearRect(0, 0, canvas.width, canvas.height)
    }
    setAllPaths([])
    setCurrentPath({ points: [], isEraser: false })
  }
  
  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-900 to-yellow-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-black/20 border-red-500/30">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold text-white mb-4">Authentication Required</h2>
            <Button onClick={() => router.push('/auth/signin')} className="w-full bg-red-600 hover:bg-red-700">
              Sign In to Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-900 to-yellow-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-black/20 border-red-500/30">
          <CardContent className="p-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-red-400" />
            <h2 className="text-xl font-bold text-white mb-2">Loading Duel...</h2>
            <p className="text-white/60">Connecting to game room</p>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  if (error || !gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-900 to-yellow-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-black/20 border-red-500/30">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold text-white mb-4">Error</h2>
            <p className="text-red-200 mb-4">{error || "Game not found"}</p>
            <Button onClick={() => router.push('/1v1')} className="w-full bg-red-600 hover:bg-red-700">
              Back to 1v1 Menu
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-900 to-yellow-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-2">
            ⚔️ 1v1 Duel
          </h1>
          <Badge variant="outline" className="border-white/30 text-white">
            Code: {gameState.code}
          </Badge>
        </div>
        
        {/* Game Status Bar */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Host Player */}
          <Card className="bg-black/20 border-orange-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Crown className="h-5 w-5 text-orange-400" />
                <div className="flex-1">
                  <p className="text-white font-bold">{gameState.host.name}</p>
                  <p className="text-orange-400 text-sm">Host</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">{gameState.hostScore}</p>
                  <p className="text-orange-400 text-sm">
                    {Math.floor(gameState.hostTimeRemaining / 60)}:{(gameState.hostTimeRemaining % 60).toString().padStart(2, '0')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Game Info */}
          <Card className="bg-black/20 border-red-500/30">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="h-5 w-5 text-red-400" />
                <span className="text-white font-bold">First to {gameState.questionsToWin}</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Clock className="h-4 w-4 text-red-400" />
                <span className="text-red-400 text-sm">{gameState.timeControl / 60}min • {gameState.difficulty}</span>
              </div>
            </CardContent>
          </Card>
          
          {/* Opponent Player */}
          <Card className="bg-black/20 border-blue-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-blue-400" />
                <div className="flex-1">
                  <p className="text-white font-bold">{gameState.opponent?.name || "Waiting..."}</p>
                  <p className="text-blue-400 text-sm">Opponent</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">{gameState.opponentScore}</p>
                  <p className="text-blue-400 text-sm">
                    {Math.floor(gameState.opponentTimeRemaining / 60)}:{(gameState.opponentTimeRemaining % 60).toString().padStart(2, '0')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Game Content */}
        {gameState.status === "WAITING" && (
          <Card className="bg-black/20 border-yellow-500/30 max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <Users className="h-16 w-16 mx-auto mb-4 text-yellow-400" />
              <h2 className="text-2xl font-bold text-white mb-4">Waiting for Opponent</h2>
              <p className="text-white/70 mb-6">Share the code <strong>{gameState.code}</strong> with your opponent</p>
              <Button 
                onClick={() => navigator.clipboard.writeText(gameState.code)}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                Copy Code
              </Button>
            </CardContent>
          </Card>
        )}
        
        {gameState.gamePhase === "countdown" && countdown > 0 && (
          <Card className="bg-black/20 border-red-500/30 max-w-xl mx-auto">
            <CardContent className="p-8 text-center">
              <div className="text-8xl font-bold text-red-400 mb-4">{countdown}</div>
              <p className="text-white text-xl">Get ready to duel!</p>
            </CardContent>
          </Card>
        )}
        
        {gameState.gamePhase === "playing" && gameState.currentProblem && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Question Panel */}
            <Card className="bg-black/20 border-red-500/30">
              <CardHeader>
                <CardTitle className="text-white text-center">
                  Question {Math.max(gameState.hostScore, gameState.opponentScore) + 1}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white rounded-lg p-4 mb-4">
                  <MathDisplay 
                    math={gameState.currentProblem.problem} 
                    display={true}
                  />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-white block mb-2">Your Answer:</label>
                    <input
                      type="text"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      disabled={hasSubmitted}
                      className="w-full p-3 rounded border bg-white/10 border-red-500/30 text-white placeholder-white/50"
                      placeholder="Enter your answer..."
                      onKeyPress={(e) => e.key === 'Enter' && submitAnswer()}
                    />
                  </div>
                  
                  <Button 
                    onClick={submitAnswer}
                    disabled={!answer.trim() || hasSubmitted}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3"
                  >
                    {hasSubmitted ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitted...
                      </>
                    ) : (
                      "Submit Answer"
                    )}
                  </Button>
                </div>
                
                {lastResult && (
                  <Alert className={`mt-4 ${lastResult.correct ? 'bg-green-500/20 border-green-500/30' : 'bg-red-500/20 border-red-500/30'}`}>
                    <AlertDescription className={lastResult.correct ? 'text-green-200' : 'text-red-200'}>
                      {lastResult.correct ? '✅ Correct!' : '❌ Incorrect'} {lastResult.feedback}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
            
            {/* Drawing Canvas */}
            <Card className="bg-black/20 border-orange-500/30">
              <CardHeader>
                <CardTitle className="text-white text-center flex items-center justify-between">
                  <span>Scratch Work</span>
                  <Button 
                    onClick={clearCanvas}
                    variant="outline"
                    size="sm"
                    className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                  >
                    Clear
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={300}
                  className="w-full border border-orange-500/30 rounded bg-white/5 cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
              </CardContent>
            </Card>
          </div>
        )}
        
        {gameState.gamePhase === "finished" && (
          <Card className="bg-black/20 border-yellow-500/30 max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <Trophy className="h-16 w-16 mx-auto mb-4 text-yellow-400" />
              <h2 className="text-3xl font-bold text-white mb-4">
                {gameState.winner?.id === playerId ? "🎉 You Won!" : `${gameState.winner?.name} Wins!`}
              </h2>
              <div className="text-xl text-white/80 mb-6">
                Final Score: {gameState.hostScore} - {gameState.opponentScore}
              </div>
              <div className="flex gap-4 justify-center">
                <Button 
                  onClick={() => router.push('/1v1')}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  Play Again
                </Button>
                <Button 
                  onClick={() => router.push('/')}
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  Home
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

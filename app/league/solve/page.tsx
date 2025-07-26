"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Lightbulb, 
  Timer, 
  Star,
  Trophy,
  TrendingUp,
  Target,
  Zap
} from "lucide-react"
import MathDisplay from "@/app/components/math-display"
import { IntegralProblem, getRandomProblem } from "@/lib/integral-database"

interface LeagueSession {
  problemsSolved: number
  pointsEarned: number
  streak: number
  accuracy: number
  timeSpent: number
  difficulty: "Basic" | "Intermediate" | "Advanced"
}

interface Problem {
  id: string
  problem: string
  solution: string
  difficulty: "Basic" | "Intermediate" | "Advanced"
  hint?: string
  points: number
}

export default function LeagueSolvePage() {
  const router = useRouter()
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null)
  const [userAnswer, setUserAnswer] = useState("")
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [timeLeft, setTimeLeft] = useState(180) // 3 minutes per problem
  const [session, setSession] = useState<LeagueSession>({
    problemsSolved: 0,
    pointsEarned: 0,
    streak: 0,
    accuracy: 0,
    timeSpent: 0,
    difficulty: "Basic"
  })
  const [isValidating, setIsValidating] = useState(false)

  const difficultyPoints = {
    "Basic": 10,
    "Intermediate": 25,
    "Advanced": 50
  }

  const difficultyColors = {
    "Basic": "bg-green-500",
    "Intermediate": "bg-yellow-500", 
    "Advanced": "bg-red-500"
  }

  // Generate new problem
  const generateProblem = () => {
    const difficulty: "Basic" | "Intermediate" | "Advanced" = 
      session.problemsSolved < 5 ? "Basic" : 
      session.problemsSolved < 15 ? "Intermediate" : "Advanced"
    
    const baseProblem = getRandomProblem(difficulty)
    
    if (!baseProblem) return
    
    const newProblem: Problem = {
      ...baseProblem,
      points: difficultyPoints[difficulty]
    }
    
    setCurrentProblem(newProblem)
    setUserAnswer("")
    setShowResult(false)
    setShowHint(false)
    setTimeLeft(180)
  }

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !showResult) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !showResult) {
      handleSubmit() // Auto-submit when time runs out
    }
  }, [timeLeft, showResult])

  // Initialize first problem
  useEffect(() => {
    generateProblem()
  }, [])

  const handleSubmit = async () => {
    if (!currentProblem) return
    
    setIsValidating(true)
    
    try {
      const response = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expression: currentProblem.problem,
          userAnswer: userAnswer.trim(),
          correctAnswer: currentProblem.solution
        })
      })
      
      const result = await response.json()
      const correct = result.isCorrect
      
      setIsCorrect(correct)
      setShowResult(true)
      
      // Update session stats
      setSession(prev => {
        const newSolved = prev.problemsSolved + 1
        const newPointsEarned = correct ? prev.pointsEarned + currentProblem.points : prev.pointsEarned
        const newStreak = correct ? prev.streak + 1 : 0
        const newAccuracy = newSolved > 0 ? ((prev.accuracy * prev.problemsSolved + (correct ? 1 : 0)) / newSolved) * 100 : 0
        
        return {
          ...prev,
          problemsSolved: newSolved,
          pointsEarned: newPointsEarned,
          streak: newStreak,
          accuracy: newAccuracy,
          timeSpent: prev.timeSpent + (180 - timeLeft),
          difficulty: currentProblem.difficulty
        }
      })
      
      // Update league points via API
      if (correct) {
        try {
          await fetch("/api/league", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              pointsEarned: currentProblem.points,
              isCorrect: true,
              problemDifficulty: currentProblem.difficulty
            })
          })
        } catch (error) {
          console.error("Failed to update league points:", error)
        }
      }
      
    } catch (error) {
      console.error("Validation error:", error)
      setIsCorrect(false)
      setShowResult(true)
    }
    
    setIsValidating(false)
  }

  const handleNext = () => {
    generateProblem()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getTimeColor = () => {
    if (timeLeft > 120) return "text-green-400"
    if (timeLeft > 60) return "text-yellow-400"
    return "text-red-400"
  }

  const getStreakEmoji = (streak: number) => {
    if (streak >= 20) return "🔥🔥🔥"
    if (streak >= 10) return "🔥🔥"
    if (streak >= 5) return "🔥"
    return ""
  }

  if (!currentProblem) {
    return <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-white text-xl">Loading...</div>
    </div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/league")}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                League Challenge
              </h1>
              <p className="text-gray-300">Earn points by solving integrals</p>
            </div>
          </div>
          
          {/* Timer */}
          <div className="flex items-center gap-2">
            <Timer className={`h-5 w-5 ${getTimeColor()}`} />
            <span className={`text-xl font-bold ${getTimeColor()}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* Session Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-black/20 border-gray-700">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-400">Problems</p>
              <p className="text-2xl font-bold text-white">{session.problemsSolved}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-black/20 border-gray-700">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-400">Points</p>
              <p className="text-2xl font-bold text-green-400">{session.pointsEarned}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-black/20 border-gray-700">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-400">Streak</p>
              <p className="text-2xl font-bold text-orange-400">
                {session.streak} {getStreakEmoji(session.streak)}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-black/20 border-gray-700">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-400">Accuracy</p>
              <p className="text-2xl font-bold text-blue-400">{session.accuracy.toFixed(1)}%</p>
            </CardContent>
          </Card>
          
          <Card className="bg-black/20 border-gray-700">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-400">Difficulty</p>
              <Badge className={`${difficultyColors[session.difficulty]} text-white`}>
                {session.difficulty}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Problem Card */}
        <Card className="bg-black/20 border-gray-700 mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-6 w-6 text-purple-400" />
                Problem #{session.problemsSolved + 1}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge className={`${difficultyColors[currentProblem.difficulty]} text-white`}>
                  {currentProblem.difficulty}
                </Badge>
                <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                  <Star className="h-3 w-3 mr-1" />
                  {currentProblem.points} pts
                </Badge>
              </div>
            </div>
            <CardDescription>
              Find the integral of the following expression
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Problem Expression */}
            <div className="bg-white/5 p-6 rounded-lg border border-gray-600">
              <MathDisplay math={`\\int ${currentProblem.problem} \\, dx`} />
            </div>

            {/* Answer Input */}
            <div className="space-y-4">
              <div className="flex gap-4">
                <Input
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Enter your answer (e.g., x^2 + C)"
                  className="flex-1 bg-white/10 border-gray-600 text-white placeholder-gray-400"
                  disabled={showResult}
                  onKeyPress={(e) => e.key === "Enter" && !showResult && handleSubmit()}
                />
                <Button
                  onClick={() => setShowHint(!showHint)}
                  variant="outline"
                  size="icon"
                  className="border-gray-600 hover:bg-white/10"
                  disabled={showResult}
                >
                  <Lightbulb className="h-4 w-4" />
                </Button>
              </div>

              {/* Hint */}
              {showHint && currentProblem.hint && (
                <Alert className="bg-blue-900/20 border-blue-700">
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription className="text-blue-200">
                    Hint: {currentProblem.hint}
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              {!showResult && (
                <Button
                  onClick={handleSubmit}
                  disabled={!userAnswer.trim() || isValidating}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isValidating ? (
                    "Validating..."
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Submit Answer
                    </>
                  )}
                </Button>
              )}

              {/* Result */}
              {showResult && (
                <div className="space-y-4">
                  <Alert className={isCorrect ? "bg-green-900/20 border-green-700" : "bg-red-900/20 border-red-700"}>
                    <div className="flex items-center gap-2">
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <AlertDescription className={isCorrect ? "text-green-200" : "text-red-200"}>
                        {isCorrect ? (
                          <>
                            <strong>Correct!</strong> You earned {currentProblem.points} points! 
                            {session.streak > 0 && (
                              <span> 🔥 {session.streak} problem streak!</span>
                            )}
                          </>
                        ) : (
                          <>
                            <strong>Incorrect.</strong> The correct answer is: {currentProblem.solution}
                          </>
                        )}
                      </AlertDescription>
                    </div>
                  </Alert>

                  <Button
                    onClick={handleNext}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Next Problem
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

            {/* Progress Indicator */}
        <Card className="bg-black/20 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Session Progress</span>
              <span className="text-sm text-gray-400">{session.problemsSolved} problems solved</span>
            </div>
            <Progress value={(session.problemsSolved % 10) * 10} className="h-2" />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                Complete 10 problems to earn a bonus multiplier!
              </p>
              {session.problemsSolved >= 10 && (
                <Button
                  onClick={() => router.push("/league/results")}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 hover:bg-white/10"
                >
                  View Results
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { 
  Trophy, 
  Star, 
  Target, 
  TrendingUp, 
  Clock, 
  Zap, 
  Award,
  Share2,
  Home,
  RotateCcw
} from "lucide-react"

interface SessionResults {
  problemsSolved: number
  pointsEarned: number
  accuracy: number
  streak: number
  longestStreak: number
  timeSpent: number
  averageTime: number
  difficultiesAttempted: { [key: string]: number }
  newRank?: number
  rankChange?: number
  bonusPoints: number
  achievements: string[]
}

export default function LeagueResultsPage() {
  const router = useRouter()
  const [results, setResults] = useState<SessionResults | null>(null)
  const [loading, setLoading] = useState(true)

  // Mock session results - in a real app, this would come from URL params or API
  useEffect(() => {
    // Simulate loading session results
    setTimeout(() => {
      setResults({
        problemsSolved: 15,
        pointsEarned: 285,
        accuracy: 86.7,
        streak: 7,
        longestStreak: 12,
        timeSpent: 720, // 12 minutes
        averageTime: 48,
        difficultiesAttempted: {
          "Basic": 8,
          "Intermediate": 5,
          "Advanced": 2
        },
        newRank: 4,
        rankChange: 1, // Moved up 1 position
        bonusPoints: 35,
        achievements: ["Hot Streak", "Speed Demon"]
      })
      setLoading(false)
    }, 1000)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
  }

  const getPerformanceRating = (accuracy: number, averageTime: number) => {
    let rating = "Good"
    let color = "text-blue-400"
    
    if (accuracy >= 90 && averageTime <= 30) {
      rating = "Exceptional"
      color = "text-purple-400"
    } else if (accuracy >= 85 && averageTime <= 45) {
      rating = "Excellent"
      color = "text-green-400"
    } else if (accuracy >= 75 && averageTime <= 60) {
      rating = "Very Good"
      color = "text-yellow-400"
    } else if (accuracy < 60) {
      rating = "Needs Improvement"
      color = "text-red-400"
    }
    
    return { rating, color }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Calculating results...</div>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">No results found</div>
      </div>
    )
  }

  const performance = getPerformanceRating(results.accuracy, results.averageTime)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Session Complete!
            </h1>
            <p className="text-xl text-gray-300 mt-2">
              Great job on your League practice session
            </p>
          </div>
          
          {/* Overall Performance */}
          <Card className="bg-black/20 border-gray-700 mb-8">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="mb-4">
                  <p className="text-lg text-gray-300">Overall Performance</p>
                  <p className={`text-3xl font-bold ${performance.color}`}>
                    {performance.rating}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-2xl font-bold text-green-400">{results.pointsEarned}</p>
                    <p className="text-sm text-gray-400">Points Earned</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-400">{results.accuracy.toFixed(1)}%</p>
                    <p className="text-sm text-gray-400">Accuracy</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-400">{results.streak}</p>
                    <p className="text-sm text-gray-400">Best Streak</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-400">#{results.newRank}</p>
                    <p className="text-sm text-gray-400">New Rank</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Performance Breakdown */}
          <Card className="bg-black/20 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-6 w-6 text-blue-400" />
                Performance Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Problems Solved</span>
                <span className="font-bold">{results.problemsSolved}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Accuracy Rate</span>
                  <span className="font-bold">{results.accuracy.toFixed(1)}%</span>
                </div>
                <Progress value={results.accuracy} className="h-2" />
              </div>
              
              <div className="flex justify-between">
                <span>Current Streak</span>
                <span className="font-bold text-orange-400">🔥 {results.streak}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Longest Streak</span>
                <span className="font-bold">{results.longestStreak}</span>
              </div>
              
              <Separator className="bg-gray-700" />
              
              <div className="flex justify-between">
                <span>Total Time</span>
                <span className="font-bold">{formatTime(results.timeSpent)}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Average Time</span>
                <span className="font-bold">{results.averageTime}s</span>
              </div>
            </CardContent>
          </Card>

          {/* Points & Ranking */}
          <Card className="bg-black/20 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-6 w-6 text-yellow-500" />
                Points & Ranking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Base Points</span>
                <span className="font-bold text-green-400">+{results.pointsEarned - results.bonusPoints}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Bonus Points</span>
                <span className="font-bold text-yellow-400">+{results.bonusPoints}</span>
              </div>
              
              <Separator className="bg-gray-700" />
              
              <div className="flex justify-between">
                <span className="text-lg">Total Points</span>
                <span className="text-lg font-bold text-green-400">+{results.pointsEarned}</span>
              </div>
              
              <Separator className="bg-gray-700" />
              
              <div className="flex justify-between items-center">
                <span>New Global Rank</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-purple-400">#{results.newRank}</span>
                  {results.rankChange && results.rankChange > 0 && (
                    <Badge className="bg-green-600 text-white">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +{results.rankChange}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Difficulty Breakdown */}
        <Card className="bg-black/20 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-purple-400" />
              Difficulty Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(results.difficultiesAttempted).map(([difficulty, count]) => (
                <div key={difficulty} className="text-center">
                  <p className="text-2xl font-bold text-white">{count}</p>
                  <p className="text-sm text-gray-400">{difficulty}</p>
                  <Badge 
                    className={
                      difficulty === "Basic" ? "bg-green-500" :
                      difficulty === "Intermediate" ? "bg-yellow-500" :
                      "bg-red-500"
                    }
                  >
                    {difficulty}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        {results.achievements.length > 0 && (
          <Card className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-yellow-700/50 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-6 w-6 text-yellow-500" />
                New Achievements!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {results.achievements.map((achievement, index) => (
                  <Badge 
                    key={index}
                    className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-4 py-2 text-sm"
                  >
                    🏆 {achievement}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => router.push("/league/solve")}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Solve More Problems
          </Button>
          
          <Button
            onClick={() => router.push("/league")}
            variant="outline"
            className="border-gray-600 hover:bg-white/10"
          >
            <Trophy className="h-4 w-4 mr-2" />
            View Leaderboard
          </Button>
          
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="border-gray-600 hover:bg-white/10"
          >
            <Home className="h-4 w-4 mr-2" />
            Main Menu
          </Button>
        </div>
      </div>
    </div>
  )
}

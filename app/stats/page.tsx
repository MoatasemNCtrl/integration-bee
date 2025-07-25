"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface GameStats {
  totalProblemsAttempted: number
  totalCorrectSolutions: number
  accuracy: string
  streakRecord: number
  totalSessions: number
  difficultyBreakdown: {
    Basic: { attempted: number; correct: number }
    Intermediate: { attempted: number; correct: number }
    Advanced: { attempted: number; correct: number }
  }
  recentSessions: Array<{
    date: string
    mode: string
    score: number
    timeSpent: number
    maxStreak: number
  }>
}

export default function StatsPage() {
  const router = useRouter()
  const [stats, setStats] = useState<GameStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const resetStats = async () => {
    if (confirm("Are you sure you want to reset all statistics? This cannot be undone.")) {
      try {
        const response = await fetch("/api/stats", { method: "DELETE" })
        if (response.ok) {
          fetchStats()
          alert("Statistics reset successfully!")
        }
      } catch (error) {
        console.error("Error resetting stats:", error)
        alert("Failed to reset statistics.")
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl">Loading statistics...</div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl">Failed to load statistics</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">📊 Statistics</h1>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Menu
          </button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg text-center">
            <div className="text-3xl font-bold">{stats.totalProblemsAttempted}</div>
            <div className="text-sm opacity-90">Problems Attempted</div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg text-center">
            <div className="text-3xl font-bold">{stats.totalCorrectSolutions}</div>
            <div className="text-sm opacity-90">Correct Solutions</div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg text-center">
            <div className="text-3xl font-bold">{stats.accuracy}</div>
            <div className="text-sm opacity-90">Accuracy Rate</div>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg text-center">
            <div className="text-3xl font-bold">{stats.streakRecord}</div>
            <div className="text-sm opacity-90">Best Streak</div>
          </div>
        </div>

        {/* Difficulty Breakdown */}
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">📈 Performance by Difficulty</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(stats.difficultyBreakdown).map(([difficulty, data]) => {
              const accuracy = data.attempted > 0 
                ? ((data.correct / data.attempted) * 100).toFixed(1)
                : "0.0"
              
              return (
                <div key={difficulty} className="bg-white p-4 rounded border">
                  <h3 className="font-semibold text-lg mb-2">{difficulty}</h3>
                  <div className="space-y-1 text-sm">
                    <div>Attempted: {data.attempted}</div>
                    <div>Correct: {data.correct}</div>
                    <div className="font-medium">Accuracy: {accuracy}%</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${accuracy}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">🕒 Recent Sessions</h2>
          {stats.recentSessions.length > 0 ? (
            <div className="space-y-3">
              {stats.recentSessions.map((session, index) => (
                <div key={index} className="bg-white p-4 rounded border flex justify-between items-center">
                  <div>
                    <div className="font-medium">{session.mode} Mode</div>
                    <div className="text-sm text-gray-600">{formatDate(session.date)}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">Score: {session.score}</div>
                    <div className="text-sm text-gray-600">
                      Streak: {session.maxStreak} | Time: {formatTime(session.timeSpent)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">
              No sessions recorded yet. Start playing to see your progress!
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => router.push("/rush")}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
          >
            🚀 Start Playing
          </button>
          <button
            onClick={resetStats}
            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
          >
            🗑️ Reset Stats
          </button>
        </div>
      </div>
    </div>
  )
}

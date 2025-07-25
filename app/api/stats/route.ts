import { NextResponse } from "next/server"

// In a real application, you'd use a database
// For now, we'll simulate with in-memory storage (this will reset on server restart)
let gameStats = {
  totalProblemsAttempted: 0,
  totalCorrectSolutions: 0,
  averageTime: 0,
  streakRecord: 0,
  difficultyBreakdown: {
    Basic: { attempted: 0, correct: 0 },
    Intermediate: { attempted: 0, correct: 0 },
    Advanced: { attempted: 0, correct: 0 }
  },
  recentSessions: [] as Array<{
    date: string,
    mode: string,
    score: number,
    timeSpent: number,
    maxStreak: number
  }>
}

export async function GET() {
  try {
    // Calculate accuracy
    const accuracy = gameStats.totalProblemsAttempted > 0 
      ? (gameStats.totalCorrectSolutions / gameStats.totalProblemsAttempted * 100).toFixed(1)
      : "0.0"

    return NextResponse.json({
      ...gameStats,
      accuracy: `${accuracy}%`,
      totalSessions: gameStats.recentSessions.length
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const { 
      mode, 
      score, 
      timeSpent, 
      maxStreak, 
      problemsAttempted, 
      correctSolutions,
      difficultyStats 
    } = await req.json()

    // Update global stats
    gameStats.totalProblemsAttempted += problemsAttempted || 0
    gameStats.totalCorrectSolutions += correctSolutions || 0
    gameStats.streakRecord = Math.max(gameStats.streakRecord, maxStreak || 0)

    // Update difficulty breakdown
    if (difficultyStats) {
      Object.keys(difficultyStats).forEach(difficulty => {
        if (gameStats.difficultyBreakdown[difficulty as keyof typeof gameStats.difficultyBreakdown]) {
          gameStats.difficultyBreakdown[difficulty as keyof typeof gameStats.difficultyBreakdown].attempted += 
            difficultyStats[difficulty].attempted || 0
          gameStats.difficultyBreakdown[difficulty as keyof typeof gameStats.difficultyBreakdown].correct += 
            difficultyStats[difficulty].correct || 0
        }
      })
    }

    // Add session to recent sessions (keep last 10)
    gameStats.recentSessions.unshift({
      date: new Date().toISOString(),
      mode: mode || "unknown",
      score: score || 0,
      timeSpent: timeSpent || 0,
      maxStreak: maxStreak || 0
    })

    // Keep only last 10 sessions
    if (gameStats.recentSessions.length > 10) {
      gameStats.recentSessions = gameStats.recentSessions.slice(0, 10)
    }

    return NextResponse.json({ 
      message: "Statistics updated successfully",
      newStats: gameStats 
    })
  } catch (error) {
    console.error("Error updating stats:", error)
    return NextResponse.json(
      { error: "Failed to update statistics" },
      { status: 500 }
    )
  }
}

// Reset stats (useful for development/testing)
export async function DELETE() {
  try {
    gameStats = {
      totalProblemsAttempted: 0,
      totalCorrectSolutions: 0,
      averageTime: 0,
      streakRecord: 0,
      difficultyBreakdown: {
        Basic: { attempted: 0, correct: 0 },
        Intermediate: { attempted: 0, correct: 0 },
        Advanced: { attempted: 0, correct: 0 }
      },
      recentSessions: []
    }

    return NextResponse.json({ message: "Statistics reset successfully" })
  } catch (error) {
    console.error("Error resetting stats:", error)
    return NextResponse.json(
      { error: "Failed to reset statistics" },
      { status: 500 }
    )
  }
}

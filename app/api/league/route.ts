import { NextRequest, NextResponse } from "next/server"

// Mock database - in a real app, this would connect to a proper database
let leaderboard = [
  { id: "1", name: "MathWhiz", points: 2847, rank: 1, streak: 12, accuracy: 94.2, problemsSolved: 156, weeklyPoints: 127, trend: "up", division: "Premier" },
  { id: "2", name: "IntegralKing", points: 2734, rank: 2, streak: 8, accuracy: 91.7, problemsSolved: 143, weeklyPoints: 98, trend: "up", division: "Premier" },
  { id: "3", name: "CalculusGuru", points: 2689, rank: 3, streak: 15, accuracy: 93.1, problemsSolved: 138, weeklyPoints: 112, trend: "same", division: "Premier" },
  { id: "4", name: "DerivativeAce", points: 2598, rank: 4, streak: 6, accuracy: 89.4, problemsSolved: 134, weeklyPoints: 89, trend: "down", division: "Premier" },
  { id: "5", name: "You", points: 2456, rank: 5, streak: 9, accuracy: 87.3, problemsSolved: 128, weeklyPoints: 76, trend: "up", division: "Premier" },
  { id: "6", name: "LimitLegend", points: 2398, rank: 6, streak: 4, accuracy: 86.8, problemsSolved: 125, weeklyPoints: 82, trend: "down", division: "Premier" },
  { id: "7", name: "SeriesSolver", points: 2342, rank: 7, streak: 11, accuracy: 88.9, problemsSolved: 119, weeklyPoints: 94, trend: "up", division: "Premier" },
  { id: "8", name: "FunctionFan", points: 2289, rank: 8, streak: 3, accuracy: 85.2, problemsSolved: 117, weeklyPoints: 67, trend: "same", division: "Premier" },
]

// GET /api/league - Get leaderboard data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'global'
    
    if (type === 'weekly') {
      // Sort by weekly points for weekly rankings
      const weeklyLeaderboard = [...leaderboard].sort((a, b) => b.weeklyPoints - a.weeklyPoints)
      return NextResponse.json({
        success: true,
        leaderboard: weeklyLeaderboard,
        type: 'weekly'
      })
    }
    
    if (type === 'user') {
      const userId = searchParams.get('userId') || '5'
      const user = leaderboard.find(player => player.id === userId)
      
      if (!user) {
        return NextResponse.json({
          success: false,
          error: 'User not found'
        }, { status: 404 })
      }
      
      return NextResponse.json({
        success: true,
        user,
        stats: {
          totalPlayers: 2847,
          yourRank: user.rank,
          yourPoints: user.points,
          weeklyRank: leaderboard.sort((a, b) => b.weeklyPoints - a.weeklyPoints).findIndex(p => p.id === userId) + 1,
          division: "Premier League",
          nextRelegation: 2200
        }
      })
    }
    
    // Default: global leaderboard
    return NextResponse.json({
      success: true,
      leaderboard,
      type: 'global'
    })
    
  } catch (error) {
    console.error('League API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch leaderboard data'
    }, { status: 500 })
  }
}

// POST /api/league - Update user points
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId = '5', pointsEarned, isCorrect, problemDifficulty } = body
    
    // Find user in leaderboard
    const userIndex = leaderboard.findIndex(player => player.id === userId)
    
    if (userIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 })
    }
    
    const user = leaderboard[userIndex]
    
    // Update user stats
    const updatedUser = {
      ...user,
      points: user.points + pointsEarned,
      problemsSolved: user.problemsSolved + 1,
      weeklyPoints: user.weeklyPoints + pointsEarned,
      streak: isCorrect ? user.streak + 1 : 0,
      accuracy: ((user.accuracy * (user.problemsSolved - 1)) + (isCorrect ? 1 : 0)) / user.problemsSolved
    }
    
    // Update in leaderboard
    leaderboard[userIndex] = updatedUser
    
    // Recalculate rankings
    leaderboard.sort((a, b) => b.points - a.points)
    leaderboard.forEach((player, index) => {
      player.rank = index + 1
    })
    
    return NextResponse.json({
      success: true,
      user: updatedUser,
      newRank: updatedUser.rank,
      pointsEarned
    })
    
  } catch (error) {
    console.error('League points update error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update points'
    }, { status: 500 })
  }
}

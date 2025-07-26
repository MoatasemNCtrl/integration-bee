import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/league - Get leaderboard data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'global'
    
    if (type === 'weekly') {
      // Get weekly leaderboard sorted by weekly points
      const users = await prisma.user.findMany({
        orderBy: { weeklyPoints: 'desc' },
        take: 50,
        select: {
          id: true,
          name: true,
          leaguePoints: true,
          weeklyPoints: true,
          currentStreak: true,
          totalProblems: true,
          correctSolved: true,
          division: true
        }
      })
      
      const leaderboard = users.map((user, index) => ({
        id: user.id,
        name: user.name || "Anonymous",
        points: user.leaguePoints,
        rank: index + 1,
        streak: user.currentStreak,
        accuracy: user.totalProblems > 0 ? (user.correctSolved / user.totalProblems) * 100 : 0,
        problemsSolved: user.totalProblems,
        weeklyPoints: user.weeklyPoints,
        trend: "same", // We'd need historical data to calculate this
        division: user.division
      }))
      
      return NextResponse.json({
        success: true,
        leaderboard,
        type: 'weekly'
      })
    }
    
    if (type === 'user') {
      const session = await getServerSession(authOptions)
      
      if (!session?.user?.id) {
        return NextResponse.json({
          success: false,
          error: 'Not authenticated'
        }, { status: 401 })
      }
      
      const user = await prisma.user.findUnique({
        where: { id: session.user.id }
      })
      
      if (!user) {
        return NextResponse.json({
          success: false,
          error: 'User not found'
        }, { status: 404 })
      }
      
      // Calculate global rank
      const higherRankedCount = await prisma.user.count({
        where: {
          leaguePoints: {
            gt: user.leaguePoints
          }
        }
      })
      
      const globalRank = higherRankedCount + 1
      
      // Calculate weekly rank
      const higherWeeklyRankedCount = await prisma.user.count({
        where: {
          weeklyPoints: {
            gt: user.weeklyPoints
          }
        }
      })
      
      const weeklyRank = higherWeeklyRankedCount + 1
      
      const totalUsers = await prisma.user.count()
      
      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          points: user.leaguePoints,
          rank: globalRank,
          streak: user.currentStreak,
          accuracy: user.totalProblems > 0 ? (user.correctSolved / user.totalProblems) * 100 : 0,
          problemsSolved: user.totalProblems,
          weeklyPoints: user.weeklyPoints,
          division: user.division
        },
        stats: {
          totalPlayers: totalUsers,
          yourRank: globalRank,
          yourPoints: user.leaguePoints,
          weeklyRank: weeklyRank,
          division: user.division,
          nextRelegation: user.division === "Premier" ? 2200 : 
                         user.division === "Championship" ? 1600 :
                         user.division === "League One" ? 1000 : null
        }
      })
    }
    
    // Default: global leaderboard
    const users = await prisma.user.findMany({
      orderBy: { leaguePoints: 'desc' },
      take: 50,
      select: {
        id: true,
        name: true,
        leaguePoints: true,
        weeklyPoints: true,
        currentStreak: true,
        totalProblems: true,
        correctSolved: true,
        division: true
      }
    })
    
    const leaderboard = users.map((user, index) => ({
      id: user.id,
      name: user.name || "Anonymous",
      points: user.leaguePoints,
      rank: index + 1,
      streak: user.currentStreak,
      accuracy: user.totalProblems > 0 ? (user.correctSolved / user.totalProblems) * 100 : 0,
      problemsSolved: user.totalProblems,
      weeklyPoints: user.weeklyPoints,
      trend: "same", // We'd need historical data to calculate this
      division: user.division
    }))
    
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
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated'
      }, { status: 401 })
    }
    
    const body = await request.json()
    const { pointsEarned, isCorrect, problemDifficulty } = body
    
    // Update user data via the user API
    const userResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/user`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pointsEarned,
        problemsSolved: 1,
        correctAnswers: isCorrect ? 1 : 0,
        newStreak: isCorrect ? undefined : 0, // Only reset streak if incorrect
        sessionData: {
          mode: 'league',
          pointsEarned,
          difficulty: problemDifficulty
        }
      })
    })
    
    if (!userResponse.ok) {
      throw new Error('Failed to update user data')
    }
    
    const userData = await userResponse.json()
    
    return NextResponse.json({
      success: true,
      user: userData.user,
      changes: userData.changes,
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

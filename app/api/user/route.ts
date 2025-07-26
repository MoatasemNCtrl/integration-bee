import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/user - Get current user data
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated'
      }, { status: 401 })
    }
    
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        gameSessions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        achievements: {
          include: {
            achievement: true
          }
        }
      }
    })
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        gameData: {
          leaguePoints: user.leaguePoints,
          totalProblems: user.totalProblems,
          correctSolved: user.correctSolved,
          currentStreak: user.currentStreak,
          longestStreak: user.longestStreak,
          division: user.division,
          weeklyPoints: user.weeklyPoints,
          joinedAt: user.joinedAt,
          lastActive: user.lastActive
        },
        recentSessions: user.gameSessions,
        achievements: user.achievements
      }
    })
    
  } catch (error) {
    console.error('User API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch user data'
    }, { status: 500 })
  }
}

// PUT /api/user - Update user game data
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated'
      }, { status: 401 })
    }
    
    const body = await request.json()
    const { 
      pointsEarned, 
      problemsSolved, 
      correctAnswers, 
      newStreak, 
      sessionData 
    } = body
    
    // Get current user data
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    })
    
    if (!currentUser) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 })
    }
    
    // Calculate new values
    const newLeaguePoints = currentUser.leaguePoints + (pointsEarned || 0)
    const newTotalProblems = currentUser.totalProblems + (problemsSolved || 0)
    const newCorrectSolved = currentUser.correctSolved + (correctAnswers || 0)
    const newLongestStreak = Math.max(currentUser.longestStreak, newStreak || 0)
    const newWeeklyPoints = currentUser.weeklyPoints + (pointsEarned || 0)
    
    // Determine division based on points
    let division = currentUser.division
    if (newLeaguePoints >= 2200) division = "Premier"
    else if (newLeaguePoints >= 1600) division = "Championship"
    else if (newLeaguePoints >= 1000) division = "League One"
    else division = "League Two"
    
    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        leaguePoints: newLeaguePoints,
        totalProblems: newTotalProblems,
        correctSolved: newCorrectSolved,
        currentStreak: newStreak || 0,
        longestStreak: newLongestStreak,
        division,
        weeklyPoints: newWeeklyPoints,
        lastActive: new Date()
      }
    })
    
    // Create game session record if provided
    if (sessionData) {
      await prisma.gameSession.create({
        data: {
          userId: session.user.id,
          mode: sessionData.mode || 'league',
          problemsSolved: sessionData.problemsSolved || 0,
          correctAnswers: sessionData.correctAnswers || 0,
          pointsEarned: sessionData.pointsEarned || 0,
          timeSpent: sessionData.timeSpent || 0,
          accuracy: sessionData.accuracy || 0,
          maxStreak: sessionData.maxStreak || 0,
          difficulty: sessionData.difficulty || 'Basic',
          completedAt: new Date()
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      user: updatedUser,
      changes: {
        pointsEarned,
        newDivision: division !== currentUser.division ? division : null,
        newRank: newLeaguePoints // We'll calculate actual rank later
      }
    })
    
  } catch (error) {
    console.error('User update error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update user data'
    }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getRandomProblem } from '@/lib/integral-database'

// GET /api/duel/game/[code] - Get current game state
export async function GET(request: NextRequest, { params }: { params: { code: string } }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const duelRoom = await prisma.duelRoom.findUnique({
      where: { code: params.code },
      include: {
        host: {
          select: { id: true, name: true, image: true }
        },
        opponent: {
          select: { id: true, name: true, image: true }
        },
        winner: {
          select: { id: true, name: true, image: true }
        }
      }
    })

    if (!duelRoom) {
      return NextResponse.json({ error: 'Duel room not found' }, { status: 404 })
    }

    // Check if user is authorized to view this game
    if (duelRoom.hostId !== session.user.id && duelRoom.opponentId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized to view this game' }, { status: 403 })
    }

    // Parse game state from JSON or create default
    let gamePhase = "waiting"
    let currentProblem = null

    if (duelRoom.status === "IN_PROGRESS") {
      if (duelRoom.gameState && typeof duelRoom.gameState === 'object') {
        const state = duelRoom.gameState as any
        gamePhase = state.gamePhase || "playing"
        if (state.currentProblem) {
          currentProblem = state.currentProblem
        }
      } else {
        gamePhase = "playing"
      }
    } else if (duelRoom.status === "COMPLETED") {
      gamePhase = "finished"
    }

    const gameState = {
      id: duelRoom.id,
      code: duelRoom.code,
      status: duelRoom.status,
      timeControl: duelRoom.timeControl,
      difficulty: duelRoom.difficulty,
      questionsToWin: duelRoom.questionsToWin,
      
      host: duelRoom.host,
      opponent: duelRoom.opponent,
      winner: duelRoom.winner,
      
      hostScore: duelRoom.hostScore,
      opponentScore: duelRoom.opponentScore,
      hostTimeRemaining: duelRoom.hostTimeRemaining || duelRoom.timeControl,
      opponentTimeRemaining: duelRoom.opponentTimeRemaining || duelRoom.timeControl,
      
      currentQuestionId: duelRoom.currentQuestionId,
      currentProblem,
      gamePhase,
      
      createdAt: duelRoom.createdAt.toISOString(),
      startedAt: duelRoom.startedAt?.toISOString(),
      completedAt: duelRoom.completedAt?.toISOString()
    }

    return NextResponse.json({ gameState })
    
  } catch (error) {
    console.error('Error fetching game state:', error)
    return NextResponse.json(
      { error: 'Failed to fetch game state' }, 
      { status: 500 }
    )
  }
}

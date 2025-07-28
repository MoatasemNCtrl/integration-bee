import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getRandomProblem } from '@/lib/integral-database'

// POST /api/duel/game/[code]/question - Start a new question
export async function POST(request: NextRequest, { params }: { params: { code: string } }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { playerId } = await request.json()

    const duelRoom = await prisma.duelRoom.findUnique({
      where: { code: params.code }
    })

    if (!duelRoom) {
      return NextResponse.json({ error: 'Duel room not found' }, { status: 404 })
    }

    // Check if user is authorized
    if (duelRoom.hostId !== session.user.id && duelRoom.opponentId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    if (duelRoom.status !== 'IN_PROGRESS') {
      return NextResponse.json({ error: 'Game not in progress' }, { status: 400 })
    }

    // Get a random problem based on difficulty
    const problem = getRandomProblem(duelRoom.difficulty as any)
    
    // Update game state with new question
    const gameState = {
      gamePhase: 'playing',
      currentProblem: problem,
      questionStartTime: new Date().toISOString()
    }

    await prisma.duelRoom.update({
      where: { id: duelRoom.id },
      data: {
        currentQuestionId: problem.id,
        gameState: gameState as any
      }
    })

    return NextResponse.json({ 
      success: true,
      gameState: {
        gamePhase: 'playing',
        currentProblem: problem
      }
    })
    
  } catch (error) {
    console.error('Error starting question:', error)
    return NextResponse.json(
      { error: 'Failed to start question' }, 
      { status: 500 }
    )
  }
}

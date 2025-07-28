import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Simple answer validation function
function validateAnswer(userAnswer: string, correctAnswer: string, alternativeForms?: string[]): boolean {
  // Normalize answers by removing spaces and converting to lowercase
  const normalize = (str: string) => str.replace(/\s+/g, '').toLowerCase()
  
  const normalizedUser = normalize(userAnswer)
  const normalizedCorrect = normalize(correctAnswer)
  
  // Check exact match
  if (normalizedUser === normalizedCorrect) return true
  
  // Check alternative forms
  if (alternativeForms) {
    for (const alt of alternativeForms) {
      if (normalizedUser === normalize(alt)) return true
    }
  }
  
  // Basic mathematical equivalence checks
  // Remove common constant notation (+ C)
  const removeC = (str: string) => str.replace(/\+c$/i, '').replace(/\+constant$/i, '')
  
  if (removeC(normalizedUser) === removeC(normalizedCorrect)) return true
  
  return false
}

// POST /api/duel/game/[code]/answer - Submit answer for current question
export async function POST(request: NextRequest, { params }: { params: { code: string } }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { playerId, answer } = await request.json()

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

    // Get current problem from game state
    const gameState = duelRoom.gameState as any
    const currentProblem = gameState?.currentProblem
    
    if (!currentProblem) {
      return NextResponse.json({ error: 'No active question' }, { status: 400 })
    }

    // Validate answer
    const isCorrect = validateAnswer(answer, currentProblem.solution, currentProblem.alternativeForms)
    
    const isHost = playerId === duelRoom.hostId
    let updateData: any = {}
    
    if (isCorrect) {
      // Award point to the player
      if (isHost) {
        updateData.hostScore = duelRoom.hostScore + 1
      } else {
        updateData.opponentScore = duelRoom.opponentScore + 1
      }
      
      // Check if game is won
      const newScore = isHost ? duelRoom.hostScore + 1 : duelRoom.opponentScore + 1
      if (newScore >= duelRoom.questionsToWin) {
        updateData.status = 'COMPLETED'
        updateData.winnerId = playerId
        updateData.completedAt = new Date()
        updateData.gameState = { gamePhase: 'finished' }
      } else {
        updateData.gameState = { gamePhase: 'result' }
      }
    } else {
      updateData.gameState = { gamePhase: 'result' }
    }

    await prisma.duelRoom.update({
      where: { id: duelRoom.id },
      data: updateData
    })

    const result = {
      correct: isCorrect,
      feedback: isCorrect ? 'Correct! +1 point' : `Incorrect. The answer was: ${currentProblem.solution}`
    }

    return NextResponse.json({ 
      success: true,
      result,
      gameState: updateData.gameState || { gamePhase: 'result' }
    })
    
  } catch (error) {
    console.error('Error submitting answer:', error)
    return NextResponse.json(
      { error: 'Failed to submit answer' }, 
      { status: 500 }
    )
  }
}

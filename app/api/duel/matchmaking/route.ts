import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/duel/matchmaking - Join random matchmaking queue
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { timeControl = 180, difficulty = "Mixed" } = await request.json()

    // Check if user is already in queue
    const existingQueue = await prisma.duelQueue.findUnique({
      where: { userId: session.user.id }
    })

    if (existingQueue) {
      return NextResponse.json({ error: 'Already in matchmaking queue' }, { status: 400 })
    }

    // Look for a matching opponent in the queue
    const potentialOpponent = await prisma.duelQueue.findFirst({
      where: {
        timeControl,
        difficulty,
        userId: { not: session.user.id }
      },
      include: {
        user: {
          select: { id: true, name: true, image: true }
        }
      },
      orderBy: { createdAt: 'asc' } // First in queue gets matched first
    })

    if (potentialOpponent) {
      // Found a match! Create a duel room
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      
      // Remove both players from queue and create duel
      await prisma.$transaction(async (tx) => {
        // Remove opponent from queue
        await tx.duelQueue.delete({
          where: { id: potentialOpponent.id }
        })

        // Create duel room
        const duelRoom = await tx.duelRoom.create({
          data: {
            code,
            hostId: potentialOpponent.userId,
            opponentId: session.user.id,
            timeControl,
            difficulty,
            questionsToWin: 5, // Default for random matches
            status: 'IN_PROGRESS',
            startedAt: new Date(),
            hostTimeRemaining: timeControl,
            opponentTimeRemaining: timeControl
          },
          include: {
            host: {
              select: { id: true, name: true, image: true }
            },
            opponent: {
              select: { id: true, name: true, image: true }
            }
          }
        })

        return duelRoom
      })

      return NextResponse.json({ 
        matched: true,
        gameUrl: `/1v1/duel/${code}?role=opponent`,
        message: 'Match found! Starting game...'
      })
      
    } else {
      // No match found, add to queue
      await prisma.duelQueue.create({
        data: {
          userId: session.user.id,
          timeControl,
          difficulty
        }
      })

      return NextResponse.json({ 
        matched: false,
        inQueue: true,
        message: 'Added to matchmaking queue. Looking for opponent...'
      })
    }
    
  } catch (error) {
    console.error('Error in matchmaking:', error)
    return NextResponse.json(
      { error: 'Matchmaking failed' }, 
      { status: 500 }
    )
  }
}

// DELETE /api/duel/matchmaking - Leave matchmaking queue
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.duelQueue.deleteMany({
      where: { userId: session.user.id }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Removed from matchmaking queue'
    })
    
  } catch (error) {
    console.error('Error leaving queue:', error)
    return NextResponse.json(
      { error: 'Failed to leave queue' }, 
      { status: 500 }
    )
  }
}

// GET /api/duel/matchmaking - Check queue status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const queueEntry = await prisma.duelQueue.findUnique({
      where: { userId: session.user.id }
    })

    return NextResponse.json({ 
      inQueue: !!queueEntry,
      queueEntry
    })
    
  } catch (error) {
    console.error('Error checking queue status:', error)
    return NextResponse.json(
      { error: 'Failed to check queue status' }, 
      { status: 500 }
    )
  }
}

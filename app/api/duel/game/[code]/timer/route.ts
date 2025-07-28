import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/duel/game/[code]/timer - Update player timer
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

    // Decrease timer for the current player
    const isHost = playerId === duelRoom.hostId
    const updateData: any = {}

    if (isHost) {
      const newTime = Math.max(0, (duelRoom.hostTimeRemaining || duelRoom.timeControl) - 1)
      updateData.hostTimeRemaining = newTime
      
      // Check if time is up
      if (newTime <= 0) {
        updateData.status = 'COMPLETED'
        updateData.winnerId = duelRoom.opponentId
        updateData.completedAt = new Date()
      }
    } else {
      const newTime = Math.max(0, (duelRoom.opponentTimeRemaining || duelRoom.timeControl) - 1)
      updateData.opponentTimeRemaining = newTime
      
      // Check if time is up
      if (newTime <= 0) {
        updateData.status = 'COMPLETED'
        updateData.winnerId = duelRoom.hostId
        updateData.completedAt = new Date()
      }
    }

    await prisma.duelRoom.update({
      where: { id: duelRoom.id },
      data: updateData
    })

    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Error updating timer:', error)
    return NextResponse.json(
      { error: 'Failed to update timer' }, 
      { status: 500 }
    )
  }
}

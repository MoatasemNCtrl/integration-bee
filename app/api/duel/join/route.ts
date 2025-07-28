import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/duel/join - Join a 1v1 duel room
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: 'Duel code required' }, { status: 400 })
    }

    // Find the duel room
    const duelRoom = await prisma.duelRoom.findUnique({
      where: { code },
      include: {
        host: {
          select: { id: true, name: true, image: true }
        },
        opponent: {
          select: { id: true, name: true, image: true }
        }
      }
    })

    if (!duelRoom) {
      return NextResponse.json({ error: 'Duel room not found' }, { status: 404 })
    }

    // Check if duel is still accepting players
    if (duelRoom.status !== 'WAITING') {
      return NextResponse.json({ error: 'Duel has already started or finished' }, { status: 400 })
    }

    // Check if duel already has an opponent
    if (duelRoom.opponentId) {
      return NextResponse.json({ error: 'Duel room is full' }, { status: 400 })
    }

    // Check if user is trying to join their own duel
    if (duelRoom.hostId === session.user.id) {
      return NextResponse.json({ error: 'Cannot join your own duel' }, { status: 400 })
    }

    // Add opponent to duel
    const updatedDuelRoom = await prisma.duelRoom.update({
      where: { id: duelRoom.id },
      data: {
        opponentId: session.user.id,
        status: 'IN_PROGRESS',
        startedAt: new Date()
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

    return NextResponse.json({ 
      success: true,
      duelRoom: updatedDuelRoom,
      playerUrl: `/1v1/duel/${code}?role=opponent`
    })
    
  } catch (error) {
    console.error('Error joining duel:', error)
    return NextResponse.json(
      { error: 'Failed to join duel' }, 
      { status: 500 }
    )
  }
}

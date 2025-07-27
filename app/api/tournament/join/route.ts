import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/tournament/join - Player joins a tournament
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: 'Tournament code required' }, { status: 400 })
    }

    // Find the tournament
    const tournament = await prisma.tournamentRoom.findUnique({
      where: { code },
      include: {
        participants: true
      }
    })

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    // Check if tournament is still accepting players
    if (tournament.status !== 'WAITING') {
      return NextResponse.json({ error: 'Tournament has already started' }, { status: 400 })
    }

    // Check if tournament is full
    if (tournament.participants.length >= tournament.maxPlayers) {
      return NextResponse.json({ error: 'Tournament is full' }, { status: 400 })
    }

    // Check if player is already in the tournament
    const existingParticipant = tournament.participants.find(p => p.userId === session.user.id)
    if (existingParticipant) {
      return NextResponse.json({ error: 'Already joined this tournament' }, { status: 400 })
    }

    // Add player to tournament
    const participant = await prisma.tournamentParticipant.create({
      data: {
        roomId: tournament.id,
        userId: session.user.id
      },
      include: {
        user: {
          select: { id: true, name: true, image: true }
        },
        room: {
          include: {
            host: {
              select: { id: true, name: true, image: true }
            },
            participants: {
              include: {
                user: {
                  select: { id: true, name: true, image: true }
                }
              },
              orderBy: { joinedAt: 'asc' }
            }
          }
        }
      }
    })

    return NextResponse.json({ 
      success: true,
      participant,
      tournament: participant.room,
      playerUrl: `/player/${code}`
    })
    
  } catch (error) {
    console.error('Error joining tournament:', error)
    return NextResponse.json(
      { error: 'Failed to join tournament' }, 
      { status: 500 }
    )
  }
}

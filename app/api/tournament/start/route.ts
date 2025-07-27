import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/tournament/start - Start a tournament
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
        participants: {
          include: {
            user: {
              select: { id: true, name: true, image: true }
            }
          }
        },
        host: {
          select: { id: true, name: true, image: true }
        }
      }
    })

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    // Check if user is the host
    if (tournament.hostId !== session.user.id) {
      return NextResponse.json({ error: 'Only the host can start the tournament' }, { status: 403 })
    }

    // Check if tournament is in the correct state
    if (tournament.status !== 'WAITING') {
      return NextResponse.json({ error: 'Tournament has already started or finished' }, { status: 400 })
    }

    // Check if there are enough players
    if (tournament.participants.length < 2) {
      return NextResponse.json({ error: 'Need at least 2 players to start' }, { status: 400 })
    }

    // Update tournament status to IN_PROGRESS
    const updatedTournament = await prisma.tournamentRoom.update({
      where: { id: tournament.id },
      data: {
        status: 'IN_PROGRESS',
        startedAt: new Date()
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, image: true }
            }
          }
        },
        host: {
          select: { id: true, name: true, image: true }
        }
      }
    })

    // TODO: Generate round-robin matches
    // For now, we'll implement a simple round-robin scheduling
    const participants = tournament.participants
    const matches = []

    // Generate all possible matches (round-robin)
    for (let i = 0; i < participants.length; i++) {
      for (let j = i + 1; j < participants.length; j++) {
        matches.push({
          roomId: tournament.id,
          player1Id: participants[i].userId,
          player2Id: participants[j].userId,
          round: Math.floor(matches.length / Math.floor(participants.length / 2)) + 1,
          status: 'SCHEDULED' as const
        })
      }
    }

    // Create the matches in the database
    await prisma.tournamentMatch.createMany({
      data: matches
    })

    return NextResponse.json({ 
      success: true,
      tournament: updatedTournament,
      matchesCreated: matches.length
    })
    
  } catch (error) {
    console.error('Error starting tournament:', error)
    return NextResponse.json(
      { error: 'Failed to start tournament' }, 
      { status: 500 }
    )
  }
}

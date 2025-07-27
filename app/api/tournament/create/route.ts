import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Generate a unique 6-digit tournament code
function generateTournamentCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// POST /api/tournament/create - Host creates a new tournament
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { maxPlayers = 8 } = await request.json()

    // Generate unique code
    let code: string
    let attempts = 0
    do {
      code = generateTournamentCode()
      const existing = await prisma.tournamentRoom.findUnique({ where: { code } })
      attempts++
      if (attempts > 10) {
        throw new Error('Unable to generate unique code')
      }
    } while (await prisma.tournamentRoom.findUnique({ where: { code } }))

    // Create tournament room
    const tournament = await prisma.tournamentRoom.create({
      data: {
        code,
        hostId: session.user.id,
        maxPlayers: Math.min(Math.max(maxPlayers, 2), 16), // Between 2-16 players
        status: 'WAITING'
      },
      include: {
        host: {
          select: { id: true, name: true, image: true }
        },
        participants: {
          include: {
            user: {
              select: { id: true, name: true, image: true }
            }
          }
        }
      }
    })

    return NextResponse.json({ 
      tournament,
      hostUrl: `/host/${code}`,
      playerUrl: `/player/${code}`
    })
    
  } catch (error) {
    console.error('Error creating tournament:', error)
    return NextResponse.json(
      { error: 'Failed to create tournament' }, 
      { status: 500 }
    )
  }
}

// GET /api/tournament/create - Get tournament by code
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    
    if (!code) {
      return NextResponse.json({ error: 'Tournament code required' }, { status: 400 })
    }

    const tournament = await prisma.tournamentRoom.findUnique({
      where: { code },
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
    })

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    return NextResponse.json({ tournament })
    
  } catch (error) {
    console.error('Error fetching tournament:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tournament' }, 
      { status: 500 }
    )
  }
}

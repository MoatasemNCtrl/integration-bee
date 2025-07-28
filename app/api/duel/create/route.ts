import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Generate a unique 6-digit duel code
function generateDuelCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// POST /api/duel/create - Create a 1v1 duel room
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { timeControl = 180, difficulty = "Mixed", questionsToWin = 5 } = await request.json()

    // Generate unique code
    let code: string
    let attempts = 0
    do {
      code = generateDuelCode()
      const existing = await prisma.duelRoom.findUnique({ where: { code } })
      attempts++
      if (attempts > 10) {
        throw new Error('Unable to generate unique code')
      }
    } while (await prisma.duelRoom.findUnique({ where: { code } }))

    // Create duel room
    const duelRoom = await prisma.duelRoom.create({
      data: {
        code,
        hostId: session.user.id,
        timeControl: Math.min(Math.max(timeControl, 60), 600), // Between 1-10 minutes
        difficulty,
        questionsToWin: Math.min(Math.max(questionsToWin, 3), 10), // Between 3-10 questions
        status: 'WAITING',
        hostTimeRemaining: timeControl,
        opponentTimeRemaining: timeControl
      },
      include: {
        host: {
          select: { id: true, name: true, image: true }
        }
      }
    })

    return NextResponse.json({ 
      duelRoom,
      hostUrl: `/1v1/duel/${code}?role=host`,
      joinUrl: `/1v1/duel/${code}?role=opponent`
    })
    
  } catch (error) {
    console.error('Error creating duel:', error)
    return NextResponse.json(
      { error: 'Failed to create duel room' }, 
      { status: 500 }
    )
  }
}

// GET /api/duel/create - Get duel room by code
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    
    if (!code) {
      return NextResponse.json({ error: 'Duel code required' }, { status: 400 })
    }

    const duelRoom = await prisma.duelRoom.findUnique({
      where: { code },
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

    return NextResponse.json({ duelRoom })
    
  } catch (error) {
    console.error('Error fetching duel room:', error)
    return NextResponse.json(
      { error: 'Failed to fetch duel room' }, 
      { status: 500 }
    )
  }
}
